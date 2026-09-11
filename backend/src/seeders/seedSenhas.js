const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const SENHA_PADRAO = '123456';

async function seedSenhas() {
  try {
    const hash = await bcrypt.hash(SENHA_PADRAO, 10);
    const usuarios = await Usuario.findAll();
    for (const u of usuarios) {
      await u.update({ senha: hash });
      console.log(`Senha atualizada: ${u.email}`);
    }
    console.log(`Todos os usuarios agora usam a senha: ${SENHA_PADRAO}`);
  } catch (err) {
    console.error('Erro ao atualizar senhas:', err.message);
  } finally {
    process.exit();
  }
}

seedSenhas();
