const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const arquivos = ['001-historico-integridade.js'];

async function migrar(sequelize) {
  // Uma unica conexao mantem o advisory lock mesmo entre comandos DDL (commit implicito no MySQL).
  const conexao = await sequelize.connectionManager.getConnection();
  const consulta = (sql, valores = []) => new Promise((resolve, reject) => conexao.query(sql, valores, (erro, linhas) => erro ? reject(erro) : resolve(linhas)));
  let trava;
  let bloqueado = false;
  try {
    const [db] = await consulta('SELECT DATABASE() AS nome');
    trava = 'giramesa:migracoes:' + createHash('sha256').update(db.nome).digest('hex').slice(0, 32);
    const [r] = await consulta('SELECT GET_LOCK(?, 15) AS obtido', [trava]);
    if (Number(r.obtido) !== 1) throw new Error('Outra migração está em andamento.');
    bloqueado = true;
    await consulta('CREATE TABLE IF NOT EXISTS schema_migrations (nome VARCHAR(100) PRIMARY KEY, checksum CHAR(64) NOT NULL, aplicada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
    for (const arquivo of arquivos) {
      const checksum = createHash('sha256').update(readFileSync(path.join(__dirname, arquivo))).digest('hex');
      const anteriores = await consulta('SELECT checksum FROM schema_migrations WHERE nome=?', [arquivo]);
      if (anteriores.length) {
        if (anteriores[0].checksum !== checksum) throw new Error('Migração aplicada foi modificada: ' + arquivo);
        continue;
      }
      await require('./' + arquivo).up(sequelize);
      await consulta('INSERT INTO schema_migrations (nome,checksum) VALUES (?,?)', [arquivo, checksum]);
      console.log('Migração aplicada: ' + arquivo);
    }
  } finally {
    try {
      if (bloqueado) await consulta('SELECT RELEASE_LOCK(?)', [trava]);
    } finally {
      await sequelize.connectionManager.releaseConnection(conexao);
    }
  }
}

module.exports = { migrar };
