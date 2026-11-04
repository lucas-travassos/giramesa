const bcrypt = require('bcrypt');
const { Transaction } = require('sequelize');
const { sequelize, Usuario } = require('../models');
const { exigir } = require('../utils/erroHttp');

async function alterar(id, dados) {
  const atualizacao = { ...dados };
  if (atualizacao.senha) atualizacao.senha = await bcrypt.hash(atualizacao.senha, 10);
  return sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (transaction) => {
    // A mesma ordem serializa duas tentativas de retirar os ultimos administradores.
    const administradores = await Usuario.findAll({ where: { nivel_acesso: 'administrador' }, order: [['usuario_id', 'ASC']], transaction, lock: transaction.LOCK.UPDATE });
    const usuario = await Usuario.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    exigir(usuario, 404, 'Usuário não encontrado.');
    const retiraAdmin = usuario.nivel_acesso === 'administrador' && usuario.status === 'ativo'
      && ((atualizacao.nivel_acesso && atualizacao.nivel_acesso !== 'administrador') || (atualizacao.status && atualizacao.status !== 'ativo'));
    exigir(!retiraAdmin || administradores.filter(a => a.status === 'ativo').length > 1, 409, 'Este é o único administrador ativo do sistema.');
    await usuario.update(atualizacao, { transaction });
    return usuario;
  });
}

module.exports = { alterar };
