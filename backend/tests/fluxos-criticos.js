// Usa somente um banco novo e uma API propria; nao carrega o ambiente da aplicacao principal.
const assert = require('node:assert/strict');
const { randomBytes, createHmac } = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const { readFileSync, unlinkSync } = require('node:fs');
const { tmpdir } = require('node:os');
const net = require('node:net');
const path = require('node:path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { emCentavos } = require('../src/utils/dinheiro');

const raiz = path.resolve(__dirname, '../..');
const backend = path.join(raiz, 'backend');
const banco = `gm_teste_${randomBytes(6).toString('hex')}`;
const usuario = banco;
const senha = randomBytes(32).toString('hex');
const container = 'giramesa-teste-' + banco.slice('gm_teste_'.length);
let administracao, conexao, api, base, ambiente, interrompido = false;
let numeroMesa = 1000;
let aprovados = 0;
const tokens = {};

async function administrar(sql) {
  return (await administracao.query(sql))[0];
}

async function consultar(sql, valores = []) {
  return (await conexao.execute(sql, valores))[0];
}

async function portaLivre() {
  const servidor = net.createServer();
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  const porta = servidor.address().port;
  await new Promise((resolve) => servidor.close(resolve));
  return porta;
}

async function iniciarApi() {
  const processo = spawn(process.execPath, ['server.js'], { cwd: backend, env: ambiente, stdio: 'ignore' });
  api = processo;
  let falhou = false;
  processo.once('error', () => { falhou = true; });
  for (let tentativa = 0; tentativa < 80; tentativa++) {
    if (falhou || processo.exitCode !== null || interrompido) break;
    try {
      const resposta = await fetch(`${base}/`, { signal: AbortSignal.timeout(500) });
      if (resposta.ok) return;
    } catch { /* Aguardar somente a API criada por este processo. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('A API descartável não iniciou.');
}

async function pararApi() {
  const processo = api;
  if (!processo || processo.exitCode !== null || processo.signalCode !== null) return;
  const terminou = once(processo, 'exit');
  processo.kill();
  await terminou;
}

for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.once(sinal, () => { interrompido = true; if (api) api.kill(); });
}

async function http(metodo, rota, corpo, perfil = 'caixa', esperado = 200) {
  const resposta = await fetch(`${base}/api${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(tokens[perfil] ? { Authorization: `Bearer ${tokens[perfil]}` } : {}) },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    signal: AbortSignal.timeout(10000),
  });
  const dados = await resposta.json();
  if (esperado !== null) assert.equal(resposta.status, esperado, `${metodo} ${rota}`);
  return { status: resposta.status, dados };
}

async function login(perfil) {
  const email = `${perfil}@teste.giramesa.local`;
  const { dados } = await http('POST', '/auth/login', { email, senha: '123456' }, 'sem_token');
  assert.equal(dados.usuario.nivel_acesso, perfil);
  // Antes de qualquer escrita HTTP, comprova que a resposta veio da API com a chave temporaria.
  const [cabecalho, conteudo, assinatura] = dados.token.split('.');
  assert.equal(assinatura, createHmac('sha256', ambiente.JWT_SECRET).update(`${cabecalho}.${conteudo}`).digest('base64url'));
  tokens[perfil] = dados.token;
}

async function novaMesa() {
  const resultado = await consultar('INSERT INTO mesas (numero,status) VALUES (?,?)', [++numeroMesa, 'disponivel']);
  return resultado.insertId;
}

async function novoProduto(preco) {
  const resultado = await consultar('INSERT INTO produtos (categoria_id,nome,descricao,preco,status) VALUES (?,?,?,?,?)',
    [1, `Teste ${numeroMesa} ${preco}`, 'Registro novo da suíte', preco, 'ativo']);
  return resultado.insertId;
}

async function novoPedido(preco = '1.00') {
  const mesa = await novaMesa();
  const produto = await novoProduto(preco);
  const { dados } = await http('POST', '/pedidos', { mesa_id: mesa }, 'garcom', 201);
  const id = dados.pedido_id;
  await http('POST', `/pedidos/${id}/itens`, { produto_id: produto }, 'garcom', 201);
  return { id, mesa, produto };
}

const fechar = (id) => http('POST', `/pedidos/${id}/fechar`);
const pagar = (id, valor, esperado = 201) => http('POST', `/pedidos/${id}/pagamentos`, { forma_pagamento: 'pix', valor }, 'caixa', esperado);

async function estado(id) {
  return (await consultar(`SELECT p.status,p.valor_total,p.data_fechamento,m.status AS mesa,
    (SELECT COUNT(*) FROM pagamentos WHERE pedido_id=p.pedido_id) AS pagamentos,
    (SELECT COALESCE(SUM(valor),0) FROM pagamentos WHERE pedido_id=p.pedido_id) AS pago
    FROM pedidos p JOIN mesas m ON m.mesa_id=p.mesa_id WHERE p.pedido_id=?`, [id]))[0];
}

async function teste(nome, executar) {
  if (interrompido) throw new Error('Execução interrompida.');
  await executar();
  aprovados++;
  console.log(`OK ${aprovados}: ${nome}`);
}

async function falharAtualizacao(tabela, executar) {
  // Trigger somente no banco criado nesta execucao; simula falha depois de uma gravacao anterior.
  assert(['mesas', 'pedidos'].includes(tabela));
  await administrar(`CREATE TRIGGER falha_induzida BEFORE UPDATE ON ${tabela}
    FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Falha induzida no teste';`);
  try { await executar(); }
  finally { await administrar(`DROP TRIGGER \`${banco}\`.falha_induzida;`); }
}

async function executar() {
  assert(/^gm_teste_[a-f0-9]{12}$/.test(banco));
  console.log('Preparando container descartável: ' + container);
  const criado = spawnSync('docker', ['run', '--detach', '--name', container, '--label', 'giramesa.teste=' + banco,
    '--publish', '127.0.0.1::3306', '--env', 'MYSQL_ROOT_PASSWORD=' + senha, '--env', 'MYSQL_ROOT_HOST=%',
    'mysql:8.4.13', '--innodb-buffer-pool-size=64M', '--max-connections=25'], { encoding: 'utf8', timeout: 60000 });
  if (criado.status !== 0) throw new Error('Não foi possível criar o MySQL descartável.');
  const publicado = spawnSync('docker', ['port', container, '3306/tcp'], { encoding: 'utf8', timeout: 10000 });
  const porta = /^127\.0\.0\.1:(\d+)$/.exec(publicado.stdout.trim());
  assert(porta, 'Porta descartável deve ser exclusiva no loopback');
  const portaBanco = Number(porta[1]);
  for(let i=0; i<150; i++) {
    if(interrompido) throw new Error('Execução interrompida.');
    try { administracao = await mysql.createConnection({ host:'127.0.0.1', port:portaBanco, user:'root', password:senha, connectTimeout:1000 }); break; }
    catch { await new Promise(resolve=>setTimeout(resolve,200)); }
  }
  assert(administracao, 'MySQL descartável não iniciou');
  await administrar(`CREATE DATABASE \`${banco}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await administrar(`CREATE USER '${usuario}'@'%' IDENTIFIED BY '${senha}';`);
  await administrar(`GRANT ALL PRIVILEGES ON \`${banco}\`.* TO '${usuario}'@'%';`);
  await administrar(`USE \`${banco}\`;`);
  const sqlInicial = readFileSync(path.join(raiz, 'docs/banco/instalacao-inicial.sql'), 'utf8').split('-- Contas ficticias.')[0];
  // O arquivo inicial tem comandos simples; nao contem procedures ou delimitadores internos.
  for(const comando of sqlInicial.replace(/^--.*$/gm,'').split(';').filter(v=>v.trim())) await administrar(comando);
  conexao = await mysql.createConnection({ host: '127.0.0.1', port: portaBanco, user: usuario, password: senha, database: banco, dateStrings: true });
  assert.equal((await consultar('SELECT DATABASE() AS banco'))[0].banco, banco);
  // Fixtures proprias: a suite nao altera contas ou registros do seed publico.
  const hash = await bcrypt.hash('123456', 10);
  for (const perfil of ['administrador', 'caixa', 'garcom']) {
    await consultar('INSERT INTO usuarios (nome,email,senha,nivel_acesso) VALUES (?,?,?,?)', ['Teste ' + perfil, perfil + '@teste.giramesa.local', hash, perfil]);
  }
  for (const categoria of ['Refrigerantes', 'Sucos', 'Pizzas', 'Hamburguers']) await consultar('INSERT INTO categorias (nome) VALUES (?)', [categoria]);
  await consultar("INSERT INTO mesas (numero,status) VALUES (900,'ocupada')");
  const legado = (await consultar("INSERT INTO produtos (categoria_id,nome,descricao,preco,status) VALUES (1,'Nome anterior','Fixture de migração',12.34,'ativo')")).insertId;
  const pedidoLegado = (await consultar("INSERT INTO pedidos (mesa_id,usuario_id,valor_total) VALUES (1,3,12.34)")).insertId;
  await consultar('INSERT INTO itens_pedido (pedido_id,produto_id,quantidade,preco_unitario) VALUES (?,?,1,12.34)', [pedidoLegado, legado]);
  const ambienteMigracao = { ...process.env, DB_HOST: '127.0.0.1', DB_PORT: String(portaBanco), DB_NAME: banco, DB_USER: usuario, DB_PASS: senha };
  const migrar = () => spawnSync(process.execPath, ['scripts/migrar.js'], { cwd: backend, env: ambienteMigracao, encoding: 'utf8', timeout: 30000 });
  await teste('migração: preflight, backfill, repetição e integridade do arquivo', async () => {
    await consultar('UPDATE produtos SET preco=-1 WHERE produto_id=?', [legado]);
    assert.equal(migrar().status, 1);
    await consultar('UPDATE produtos SET preco=12.34 WHERE produto_id=?', [legado]);
    assert.equal(migrar().status, 0);
    assert.equal((await consultar('SELECT nome_produto FROM itens_pedido WHERE pedido_id=?', [pedidoLegado]))[0].nome_produto, 'Nome anterior');
    assert.equal(migrar().status, 0);
    const registro = (await consultar('SELECT * FROM schema_migrations'))[0];
    assert.equal((await consultar('SELECT COUNT(*) n FROM schema_migrations'))[0].n, 1);
    await consultar("UPDATE schema_migrations SET checksum=REPEAT('0',64)");
    assert.equal(migrar().status, 1);
    await consultar('UPDATE schema_migrations SET checksum=?', [registro.checksum]);
    assert((await consultar('SHOW INDEX FROM pedidos')).some(i => i.Key_name === 'ix_pedidos_status_fechamento'));
    await assert.rejects(consultar('UPDATE produtos SET preco=0 WHERE produto_id=?', [legado]));
    await assert.rejects(consultar('UPDATE itens_pedido SET quantidade=0 WHERE pedido_id=?', [pedidoLegado]));
  });

  const portaApi = await portaLivre();
  base = `http://127.0.0.1:${portaApi}`;
  ambiente = { ...process.env, PORT: String(portaApi), DB_HOST: '127.0.0.1', DB_PORT: String(portaBanco),
    DB_NAME: banco, DB_USER: usuario, DB_PASS: senha, JWT_SECRET: randomBytes(32).toString('hex'),
    LOGIN_MAX_TENTATIVAS: '3', LOGIN_JANELA_MS: '1000', CORS_ORIGINS: 'http://localhost:5173' };
  await iniciarApi();
  console.log(`Banco descartável: ${banco}; API própria na porta ${portaApi}.`);

  await teste('conversão exata e limites de centavos', async () => {
    assert.equal(emCentavos('999999.99'), 99999999);
    assert.equal(emCentavos(0.1), 10);
    for (const valor of [0.001, true, null, '1e-2', '1abc', '1000000.00']) assert.equal(emCentavos(valor), null);
  });
  await teste('três perfis, autenticação e permissões', async () => {
    for (const perfil of ['administrador', 'caixa', 'garcom']) {
      await login(perfil);
      await http('GET', '/mesas', undefined, perfil);
      await http('GET', '/produtos', undefined, perfil);
      await http('GET', '/usuarios', undefined, perfil, perfil === 'administrador' ? 200 : 403);
      await http('GET', '/dashboard', undefined, perfil, perfil === 'administrador' ? 200 : 403);
    }
    await http('GET', '/pedidos', undefined, 'sem_token', 401);
    await http('POST', '/auth/login', { email: 'administrador@teste.giramesa.local', senha: 'incorreta' }, 'sem_token', 401);
  });
  await teste('abertura e incremento simultâneos sem duplicação; alteração e remoção', async () => {
    const mesa = await novaMesa(), produto = await novoProduto('0.71');
    const aberturas = await Promise.all([1, 2].map(() => http('POST', '/pedidos', { mesa_id: mesa }, 'garcom', null)));
    assert.deepEqual(aberturas.map(r => r.status).sort(), [200, 201]);
    const id = aberturas[0].dados.pedido_id;
    assert.equal(id, aberturas[1].dados.pedido_id);
    await Promise.all([1, 2].map(() => http('POST', `/pedidos/${id}/itens`, { produto_id: produto }, 'garcom', 201)));
    const itens = await consultar('SELECT * FROM itens_pedido WHERE pedido_id=?', [id]);
    assert.equal(itens.length, 1); assert.equal(itens[0].quantidade, 2);
    assert.equal((await estado(id)).valor_total, '1.42');
    await http('PUT', `/pedidos/${id}/itens/${itens[0].item_id}`, { quantidade: 3 }, 'garcom');
    assert.equal((await estado(id)).valor_total, '2.13');
    await http('DELETE', `/pedidos/${id}/itens/${itens[0].item_id}`, undefined, 'garcom');
    assert.equal((await estado(id)).valor_total, '0.00');
    await http('POST', `/pedidos/${id}/fechar`, undefined, 'caixa', 409);
    await http('POST', `/pedidos/${id}/itens`, { produto_id: produto, quantidade: 1.5 }, 'garcom', 400);
  });
  await teste('um centavo pendente não finaliza; excesso é recusado; quitação exata', async () => {
    const { id } = await novoPedido('0.30');
    await http('POST', `/pedidos/${id}/fechar`, undefined, 'garcom', 403);
    await fechar(id);
    await http('POST', `/pedidos/${id}/pagamentos`, { forma_pagamento: 'pix', valor: '0.30' }, 'garcom', 403);
    await http('POST', `/pedidos/${id}/cancelar-fechamento`, undefined, 'garcom', 403);
    const parcial = await pagar(id, '0.29');
    assert.equal(parcial.dados.saldo_restante, '0.01');
    let atual = await estado(id);
    assert.equal(atual.status, 'em_fechamento'); assert.equal(atual.mesa, 'caixa'); assert.equal(atual.data_fechamento, null);
    await pagar(id, '0.02', 409);
    await http('POST', `/pedidos/${id}/cancelar-fechamento`, undefined, 'caixa', 409);
    await pagar(id, '0.01');
    atual = await estado(id);
    assert.equal(atual.status, 'finalizado'); assert.equal(atual.mesa, 'disponivel'); assert(atual.data_fechamento);
    const lista = (await http('GET', `/pedidos/${id}/pagamentos`)).dados;
    assert.equal(lista.total_pago, '0.30'); assert.equal(lista.saldo_restante, '0.00');
    await pagar(id, '0.01', 409);
  });
  await teste('valores inválidos e forma inválida não gravam pagamentos', async () => {
    const { id } = await novoPedido('10.00'); await fechar(id);
    await http('POST', `/pedidos/${id}/pagamentos`, undefined, 'caixa', 400);
    for (const valor of [0, -1, null, true, {}, [], 'abc', '1abc', '1e-2', '0,10', 0.001, '9999999.99']) await pagar(id, valor, 400);
    await http('POST', `/pedidos/${id}/pagamentos`, { forma_pagamento: 'outra', valor: 1 }, 'caixa', 400);
    assert.equal((await estado(id)).pagamentos, 0);
    await http('POST', `/pedidos/${id}/cancelar-fechamento`);
    assert.equal((await estado(id)).status, 'aberto');
  });
  await teste('divisão 39,33 + 39,33 + 39,34 fecha exatamente 118,00', async () => {
    const { id } = await novoPedido('118.00'); await fechar(id);
    for (const valor of ['39.33', 39.33, '39.34']) await pagar(id, valor);
    const atual = await estado(id);
    assert.equal(atual.pago, '118.00'); assert.equal(atual.pagamentos, 3); assert.equal(atual.status, 'finalizado');
  });
  await teste('pagamentos simultâneos não ultrapassam o saldo nem duplicam quitação', async () => {
    for (const [total, parcela] of [['10.00', '10.00'], ['100.00', '60.00']]) {
      const { id } = await novoPedido(total); await fechar(id);
      const respostas = await Promise.all([pagar(id, parcela, null), pagar(id, parcela, null)]);
      assert.deepEqual(respostas.map(r => r.status).sort(), [201, 409]);
      const atual = await estado(id); assert.equal(atual.pagamentos, 1); assert.equal(atual.pago, parcela);
      assert.equal(atual.status, total === parcela ? 'finalizado' : 'em_fechamento');
    }
  });
  await teste('pagamento versus reabertura mantém um único estado válido', async () => {
    const { id } = await novoPedido(); await fechar(id);
    const respostas = await Promise.all([pagar(id, '1.00', null), http('POST', `/pedidos/${id}/cancelar-fechamento`, undefined, 'caixa', null)]);
    const atual = await estado(id);
    if (atual.status === 'finalizado') {
      assert.equal(respostas[0].status, 201); assert.equal(respostas[1].status, 409);
      assert.equal(atual.mesa, 'disponivel'); assert.equal(atual.pago, '1.00');
    } else {
      assert.equal(atual.status, 'aberto'); assert.equal(atual.mesa, 'ocupada'); assert.equal(atual.pagamentos, 0);
      assert.equal(respostas[0].status, 409); assert.equal(respostas[1].status, 200);
    }
  });
  await teste('item versus fechamento não altera consumo após fechar', async () => {
    const { id } = await novoPedido('2.00'), produto = await novoProduto('3.00');
    const [adicao] = await Promise.all([http('POST', `/pedidos/${id}/itens`, { produto_id: produto }, 'garcom', null), fechar(id)]);
    assert([201, 409].includes(adicao.status));
    const atual = await estado(id); assert.equal(atual.status, 'em_fechamento');
    assert.equal(atual.valor_total, adicao.status === 201 ? '5.00' : '2.00');
    await http('POST', `/pedidos/${id}/itens`, { produto_id: produto }, 'garcom', 409);
  });
  await teste('falhas induzidas revertem abertura, fechamento, reabertura e pagamento', async () => {
    const mesa = await novaMesa();
    await falharAtualizacao('mesas', () => http('POST', '/pedidos', { mesa_id: mesa }, 'garcom', 500));
    assert.equal((await consultar('SELECT COUNT(*) n FROM pedidos WHERE mesa_id=?', [mesa]))[0].n, 0);
    const { id } = await novoPedido();
    const antes = await estado(id);
    await falharAtualizacao('mesas', () => http('POST', `/pedidos/${id}/fechar`, undefined, 'caixa', 500));
    assert.deepEqual(await estado(id), antes);
    await fechar(id);
    const emFechamento = await estado(id);
    await falharAtualizacao('mesas', () => http('POST', `/pedidos/${id}/cancelar-fechamento`, undefined, 'caixa', 500));
    assert.deepEqual(await estado(id), emFechamento);
    await falharAtualizacao('mesas', () => pagar(id, '1.00', 500));
    assert.deepEqual(await estado(id), emFechamento);
    await pagar(id, '1.00');
  });
  await teste('falha no recálculo desfaz o item inserido', async () => {
    const { id, produto } = await novoPedido();
    const antes = await consultar('SELECT quantidade FROM itens_pedido WHERE pedido_id=?', [id]);
    await falharAtualizacao('pedidos', () => http('POST', `/pedidos/${id}/itens`, { produto_id: produto }, 'garcom', 500));
    assert.deepEqual(await consultar('SELECT quantidade FROM itens_pedido WHERE pedido_id=?', [id]), antes);
    assert.equal((await estado(id)).valor_total, '1.00');
  });
  await teste('dashboard só inclui a venda após quitação', async () => {
    const antes = (await http('GET', '/dashboard', undefined, 'administrador')).dados;
    const { id } = await novoPedido('8.00'); await fechar(id); await pagar(id, '4.00');
    const parcial = (await http('GET', '/dashboard', undefined, 'administrador')).dados;
    assert.equal(parcial.faturamento_dia, antes.faturamento_dia);
    await pagar(id, '4.00');
    const depois = (await http('GET', '/dashboard', undefined, 'administrador')).dados;
    assert.equal(depois.data_referencia, antes.data_referencia, 'Virada do dia: repetir a suíte');
    assert.equal(Math.round(depois.faturamento_dia * 100), Math.round(antes.faturamento_dia * 100) + 800);
    assert.equal(depois.total_pedidos, antes.total_pedidos + 1);
  });
  await teste('falha de conexão e recuperação da API própria', async () => {
    await pararApi();
    await assert.rejects(fetch(`${base}/`, { signal: AbortSignal.timeout(1000) }));
    await iniciarApi(); await login('caixa'); await http('GET', '/pedidos');
  });
  await teste('headers, CORS, JSON de erro e limite de login', async () => {
    const raizApi = await fetch(base);
    assert.equal(raizApi.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(raizApi.headers.get('x-powered-by'), null);
    const permitida = await fetch(base + '/api/mesas', { headers: { Origin: 'http://localhost:5173', Authorization: 'Bearer ' + tokens.caixa } });
    assert.equal(permitida.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    const negada = await fetch(base + '/api/mesas', { headers: { Origin: 'http://nao-permitida.local' } });
    assert.equal(negada.status, 403); assert.equal(typeof (await negada.json()).erro, 'string');
    const invalida = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalida.status, 400); assert.equal(typeof (await invalida.json()).erro, 'string');
    const grande = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campo: 'x'.repeat(17000) }) });
    assert.equal(grande.status, 413); assert.equal(typeof (await grande.json()).erro, 'string');
    await http('GET', '/nao-existe', undefined, 'sem_token', 404);
    await http('GET', '/pedidos/abc', undefined, 'caixa', 400);
    for (let i=0; i<3; i++) await http('POST', '/auth/login', { email: 'caixa@teste.giramesa.local', senha: 'incorreta' }, 'sem_token', 401);
    const bloqueada = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'caixa@teste.giramesa.local', senha: 'incorreta' }) });
    assert.equal(bloqueada.status, 429); assert(Number(bloqueada.headers.get('retry-after')) > 0);
    assert.equal(typeof (await bloqueada.json()).erro, 'string');
    await new Promise(resolve => setTimeout(resolve, 1100));
    await login('caixa');
  });
  await teste('validação dos cadastros e proteção do histórico', async () => {
    await http('POST', '/categorias', { nome: '   ' }, 'administrador', 400);
    await http('POST', '/produtos', { categoria_id: 1, nome: 'Novo', preco: '0.001' }, 'administrador', 400);
    await http('POST', '/mesas', { numero: 1.5 }, 'administrador', 400);
    await http('POST', '/usuarios', { nome: 'Novo', email: 'invalido', senha: '123456', nivel_acesso: 'garcom' }, 'administrador', 400);
    const categoria = (await http('POST', '/categorias', { nome: 'Categoria fixture' }, 'administrador', 201)).dados;
    const produto = (await http('POST', '/produtos', { categoria_id: categoria.categoria_id, nome: 'Produto fixture', descricao: '', preco: '2.50' }, 'administrador', 201)).dados;
    await http('DELETE', '/categorias/' + categoria.categoria_id, undefined, 'administrador', 409);
    await http('PUT', '/produtos/' + produto.produto_id, { categoria_id: 999999 }, 'administrador', 400);
    const venda = await novoPedido('3.00');
    const nomeVendido = (await consultar('SELECT nome_produto FROM itens_pedido WHERE pedido_id=?', [venda.id]))[0].nome_produto;
    await http('PUT', '/produtos/' + venda.produto, { nome: 'Nao permitido' }, 'administrador', 409);
    await http('PUT', '/mesas/' + venda.mesa, { numero: 999999 }, 'administrador', 409);
    await http('DELETE', '/mesas/' + venda.mesa, undefined, 'administrador', 409);
    // Simula alteracao externa futura somente no produto novo da fixture.
    await consultar('UPDATE produtos SET nome=? WHERE produto_id=?', ['Catalogo alterado', venda.produto]);
    const lido = (await http('GET', '/pedidos/' + venda.id)).dados;
    assert.equal(lido.ItemPedidos[0].nome_produto, nomeVendido);
    assert.equal(lido.ItemPedidos[0].Produto.nome, 'Catalogo alterado');
  });
  await teste('seed com snapshot pode ser repetido sem duplicação', async () => {
    const hash = await bcrypt.hash('123456', 10);
    await consultar('INSERT INTO usuarios (nome,email,senha,nivel_acesso) VALUES (?,?,?,?)', ['Fixture demo', 'garcom@giramesa.com', hash, 'garcom']);
    const rodar = arquivo => { const r=spawnSync(process.execPath, ['src/seeders/' + arquivo], { cwd: backend, env: ambiente, encoding: 'utf8', timeout: 30000 }); assert.equal(r.status,0); assert(!/Erro no|Falha/i.test(r.stdout+r.stderr)); };
    rodar('seed.js'); rodar('seedDemo.js');
    const capturar = async () => {
      const resultado = {};
      for (const tabela of ['categorias', 'produtos', 'mesas', 'pedidos', 'itens_pedido', 'pagamentos']) {
        resultado[tabela] = (await consultar('SELECT * FROM `' + tabela + '`')).map(linha => JSON.stringify(linha)).sort();
      }
      return resultado;
    };
    const antes = await capturar();
    rodar('seed.js'); rodar('seedDemo.js');
    assert.deepEqual(await capturar(), antes);
    assert.equal((await consultar('SELECT COUNT(*) n FROM itens_pedido WHERE nome_produto IS NULL OR nome_produto=\'\''))[0].n,0);
  });
  await teste('backup lógico pode ser restaurado em banco novo', async () => {
    const arquivo = path.join(tmpdir(), banco + '-backup.sql');
    let restauracao;
    try {
      const r = spawnSync(process.execPath, ['scripts/backup.js', arquivo], { cwd: backend, env: ambiente, encoding:'utf8', timeout:30000 });
      assert.equal(r.status,0);
      const destino = banco + '_restaurado';
      await administrar('CREATE DATABASE `' + destino + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      restauracao = await mysql.createConnection({ host:'127.0.0.1', port:portaBanco, user:'root', password:senha, database:destino, dateStrings:true, multipleStatements:true });
      await restauracao.query(readFileSync(arquivo,'utf8'));
      const tabelas = await consultar('SHOW TABLES');
      for(const registro of tabelas) {
        const tabela = Object.values(registro)[0];
        const antes = await consultar('SELECT * FROM `' + tabela + '`');
        const depois = (await restauracao.query('SELECT * FROM `' + tabela + '`'))[0];
        const ordenar = linhas=>linhas.map(l=>JSON.stringify(l)).sort();
        assert.deepEqual(ordenar(depois), ordenar(antes), tabela);
      }
    } finally {
      if(restauracao) await restauracao.end();
      try { unlinkSync(arquivo); } catch(erro) { if(erro.code!=='ENOENT') throw erro; }
    }
  });
  await teste('inativação e troca de perfil invalidam permissões do token existente', async () => {
    const cadastro = { nome: 'Fixture token', email: 'token@teste.giramesa.local', senha: '123456', nivel_acesso: 'administrador' };
    const novo = (await http('POST', '/usuarios', cadastro, 'administrador', 201)).dados;
    assert(!Object.hasOwn(novo, 'senha'));
    const autenticado = (await http('POST', '/auth/login', { email: cadastro.email, senha: '123456' }, 'sem_token')).dados;
    tokens.fixture = autenticado.token;
    await http('PUT', '/usuarios/' + novo.usuario_id, { nivel_acesso: 'garcom', senha: '' }, 'administrador');
    await http('GET', '/usuarios', undefined, 'fixture', 403);
    await http('DELETE', '/usuarios/' + novo.usuario_id, undefined, 'administrador');
    await http('GET', '/mesas', undefined, 'fixture', 401);
  });
  await teste('duas inativações simultâneas preservam um administrador ativo', async () => {
    const segundo = (await http('POST', '/usuarios', { nome: 'Segundo teste', email: 'segundo@teste.giramesa.local', senha: '123456', nivel_acesso: 'administrador' }, 'administrador', 201)).dados;
    tokens.segundo = (await http('POST', '/auth/login', { email: 'segundo@teste.giramesa.local', senha: '123456' }, 'sem_token')).dados.token;
    const primeiro = (await consultar('SELECT usuario_id FROM usuarios WHERE email=?', ['administrador@teste.giramesa.local']))[0].usuario_id;
    const respostas = await Promise.all([http('DELETE', '/usuarios/' + primeiro, undefined, 'administrador', null), http('DELETE', '/usuarios/' + segundo.usuario_id, undefined, 'segundo', null)]);
    assert.deepEqual(respostas.map(r=>r.status).sort(), [200,409]);
    assert.equal((await consultar("SELECT COUNT(*) n FROM usuarios WHERE nivel_acesso='administrador' AND status='ativo'"))[0].n,1);
  });

}

(async () => {
  try {
    await executar();
    console.log(`Resultado: ${aprovados} grupos aprovados.`);
  } catch (erro) {
    console.error(`FALHA após ${aprovados} grupos: ${erro.message}`);
    process.exitCode = 1;
  } finally {
    try {
      await pararApi();
      if (conexao) await conexao.end();
      if (administracao) await administracao.end();
      const identidade = spawnSync('docker', ['inspect', '--format', '{{ index .Config.Labels "giramesa.teste" }}', container], { encoding:'utf8', timeout:10000 });
      if(identidade.status===0) {
        assert.equal(identidade.stdout.trim(), banco, 'Recusar limpeza de container alheio');
        const removido=spawnSync('docker', ['rm', '--force', '--volumes', container], { encoding:'utf8', timeout:30000 });
        assert.equal(removido.status,0,'Container descartável não removido');
      } else if (!/No such (object|container)/i.test(identidade.stderr || '')) {
        throw new Error('Não foi possível confirmar a remoção do container descartável.');
      }
      console.log('Limpeza concluída: somente container, volume anônimo e API desta execução.');
    } catch {
      console.error(`Limpeza incompleta. Conferir manualmente somente o container ${container}.`);
      process.exitCode = 1;
    }
  }
})();
