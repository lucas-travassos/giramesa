const sequelize = require('../src/config/database');
const { migrar } = require('../src/migrations');

(async () => {
  try { await sequelize.authenticate(); await migrar(sequelize); console.log('Banco atualizado.'); }
  catch (erro) { console.error(erro.message.startsWith('Migra') || erro.message.startsWith('Outra') ? erro.message : 'Falha na migração; conferir conexão e schema.'); process.exitCode = 1; }
  finally { await sequelize.close(); }
})();
