const fs = require('node:fs');
const path = require('node:path');
const { Transaction } = require('sequelize');
const sequelize = require('../src/config/database');

(async () => {
  let arquivo;
  try {
    if (!process.argv[2]) throw new Error('Informe um arquivo de destino fora do repositório.');
    const destino = path.resolve(process.argv[2]);
    const raiz = path.resolve(__dirname, '../..');
    const relativo = path.relative(raiz, destino);
    if (!relativo.startsWith('..' + path.sep) && !path.isAbsolute(relativo)) throw new Error('O backup deve ficar fora do repositório.');
    arquivo = fs.openSync(destino, 'wx');
    const gravar = (texto) => fs.writeSync(arquivo, texto + '\n');
    const qi = sequelize.getQueryInterface();
    gravar('-- Backup privado GiraMesa. Restaurar somente em banco NOVO e vazio.');
    gravar("SET NAMES utf8mb4; SET time_zone='+00:00'; SET FOREIGN_KEY_CHECKS=0;");
    await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ }, async (transaction) => {
      const tabelas = await qi.showAllTables({ transaction });
      for (const tabela of tabelas) {
        const nome = qi.quoteIdentifier(tabela);
        const [ddl] = await sequelize.query('SHOW CREATE TABLE ' + nome, { transaction });
        gravar(ddl[0]['Create Table'] + ';');
        const [linhas] = await sequelize.query('SELECT * FROM ' + nome, { transaction });
        for (const linha of linhas) {
          const campos = Object.keys(linha).map(c => qi.quoteIdentifier(c)).join(',');
          const valores = Object.values(linha).map(v => sequelize.escape(v)).join(',');
          gravar(`INSERT INTO ${nome} (${campos}) VALUES (${valores});`);
        }
      }
    });
    gravar('SET FOREIGN_KEY_CHECKS=1;');
    console.log('Backup lógico concluído no destino informado.');
  } catch (erro) {
    console.error(erro.message.startsWith('Informe') || erro.message.startsWith('O backup') ? erro.message : 'Falha no backup. Preservar a origem; arquivo parcial não comprova restauração.');
    process.exitCode = 1;
  } finally {
    if (arquivo !== undefined) fs.closeSync(arquivo);
    await sequelize.close();
  }
})();
