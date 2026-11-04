# STATUS — GiraMesa

> Atualizado em 04/11/2026. Estado atual em STATUS; evidências em TESTES; histórico no Git/PRs.

## Repositório e publicação

- Usar C:/Projetos/giramesa, branch develop. 12.4/bloco 14 publicados: d37f35f (backend/ambiente), 15205f3 (frontend), 9853202 (documentação). A implementação da Fase B está publicada em 828127a, com aceite funcional em 04/11. Fechamento documental e README resumido nesta entrega. Publicação em develop e abertura de PR para main autorizadas; merge depende de revisão e regressão crítica aprovada.
- PR #2 integrado em 29/10, main em b29434b na conferência remota de 04/11. A árvore antiga C:/xampp/htdocs/giramesa é somente referência; seu STATUS encaminha a retomada.

## Ambiente e preservação

- MySQL 8.4.13 em Compose giramesa, 127.0.0.1:3309, volume giramesa_dados_mysql. API e Vite locais em 3001/5173; acesso http://localhost:5173. Banco da API: giramesa_validacao_manual_20261028. Docker Desktop 4.97.0, Node 24.19.0/npm 11.17.0.
- Após interrupção, API/Vite estavam desligados e foram reiniciados. O banco permaneceu saudável. EstoqueFacil (estoque-api/3000, estoque-db/3308) e MySQL80/3307 preservados. Não presumir MariaDB de recuperação em 3308, reiniciar serviços compartilhados ou desinstalar XAMPP.
- Backups e manifesto privados em C:/Backups/GiraMesa/20261104: giramesa-antes-bloco14.sql, 26.502 bytes, SHA-256 eb63d68455beb034aefffd159ce93ce9883423a064ef055af986354f623322fd; giramesa-apos-bloco14.sql, 29.107 bytes, SHA-256 8112aa298302a7f5e69bc9c613648aea0b75bbcf3614af28fb986245ec73ac96. Não publicar dumps/configurações privadas.
- Cópias anteriores em C:/Backups/GiraMesa/20261028. A referência da migração foi o dump externo validado; origem online não revalidada após 3308 passar ao EstoqueFacil. Cópia física antiga teve ibdata1/ib_logfile0 divergentes: usar dump lógico. Diferença preexistente do banco giramesa (R$ 2.615,00 versus R$ 2.597,00) não corrigida automaticamente.
- Backup pelo script db:backup gera arquivo novo fora do repositório. Restauração isolada aprovada na suíte; retorno por projeto Compose alternativo não executado. Procedimentos em instalacao.md e banco/migracoes.md. Nunca usar down -v, reset de fábrica ou importar mysql.* entre MariaDB/MySQL.

## Bloco 14 — concluído

- Aceite manual conjunto em 04/11 e financeiro de quatro passos em 29/10. Vinte grupos automatizados aprovados em container/API próprios, sem mounts do Windows ou credenciais do banco principal; incluem finanças, concorrência/rollback, perfis, schemas, snapshot, CORS/headers/429, migrations/checksum, seeds e restauração. Não repetir sem mudança ou risco novo.
- Dinheiro em centavos, transações READ COMMITTED com bloqueios mesa → pedido, services de pedidos/usuários, proteção do último administrador e perfil/situação atuais conferidos no banco. Item mantém nome_produto e preco_unitario vendidos. Helmet 8.3.0 e express-rate-limit 8.7.2 autorizados; sem bibliotecas adicionais.
- Migration 001 aplicada após backup: sete tabelas de domínio mais schema_migrations. Campos anteriores iguais por SHA-256; referência anterior ao aceite posterior: 23 pedidos, 32 pagamentos e R$ 1.262,30. DDL sem rollback automático; não editar migration aplicada. npm run db:migrate precede API/seeds após importação.
- Audit mantém dois apontamentos moderados de uuid via Sequelize, risco aceito, sem alto/crítico no backend. Não houve audit fix --force. Travamento anterior de arquivos montados recuperado por reinício autorizado; causa não comprovada, suíte agora isolada sem mounts.

## Fase B — implementada e aprovada

- Testes executados e implementações de 13.1–13.6 aprovadas pelo responsável pelo produto em 04/11/2026. Aceite registrado em TESTES; implementação publicada em 828127a. Detalhes do ambiente e IDs dos registros dessa execução não informados.

- 13.1–13.6 agrupados: validação por campo nos quatro cadastros, estados compartilhados de carga/erro, modais com foco/Tab/Escape e fundo inerte, rótulos e teclado. A API mantém regras e validações; nenhum endpoint/backend alterado.
- Carrinho fixo e expansível abaixo de 992px, lateral sticky no desktop, categorias com rolagem e controles de 44px. Controles bloqueados durante envio. O carrinho permanece local ao Pinia, sem persistência após reload. Checkout bloqueia pessoas fracionadas/negativas, valor com mais de duas casas e excesso.
- Identidade em verde, fontes do sistema, marca da xícara e favicon SVG local. Idioma pt-BR, título da aba, foco visível, contraste das combinações principais calculado e movimento reduzido. Documentação técnica em telas/README.md.
- Revisão do agente pelo navegador em 04/11: login vazio, formulários de produto/usuário, foco/Tab/Escape, edição com categoria correta, cadastro de mesa e carrinho em 360×800 e 390×844. Primeiro clique em Salvar corrigido para evitar deslocamento por mensagem de blur. Adição por Enter aprovada.
- Mesa nova 95904 (id 9), pedido 25, duas unidades de Demo - Suco/R$ 16,00 enviados e quitados em Pix como administrador; mesa liberada. Garçom conferido com adição/remoção local, sem outro envio; carrinho encerrado vazio. Nenhum seed alterado. Captura privada em C:/Backups/GiraMesa/20261104/revisao-ux-mobile.jpg.
- Somente API/3001 parada para teste de rede: erro visível no salão, reinício e Tentar novamente recuperaram dados. A revisão do agente não substitui aceite do produto. Build/ESLint e validadores passaram; resultados e roteiro em TESTES.

## Próximos passos e limites

- Aceite da Fase B registrado e itens 13.1–13.6 marcados no plano, com documentação técnica atualizada. README principal apresenta o projeto e a stack; instalação, testes e recuperação preservados em docs/instalacao.md.
- Verificação pré-PR em 04/11: build, ESLint sem correção, links locais e diff --check aprovados. Regressão crítica não executada: duas tentativas interrompidas antes do primeiro grupo por timeout de 60s ao iniciar o MySQL descartável (docker run). Limpeza dos recursos de teste concluída; serviços principais preservados. O resultado anterior de 20 grupos não equivale à reexecução sobre 828127a. Reexecutar antes do merge; não reiniciar serviços compartilhados como atalho.
- Leitor de tela, aparelho físico, zoom de 200%, regressão integral após a Fase B e npm ci em outra máquina não comprovados. Testes anteriores de API não são auditoria visual ou teste de carga/queda do MySQL.
- Próxima etapa: revisar o PR de develop para main, resolver a pendência de regressão crítica e seguir com documentação acadêmica/API/figuras e roteiro de apresentação. Sistema/documentação prontos até 20/11/2026; apresentação em 24/11/2026. Sem deploy, CI, containerização da aplicação ou relatórios por checkpoint.
