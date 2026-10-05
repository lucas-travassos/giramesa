// Recebe uma lista de perfis autorizados e bloqueia quem nao estiver nela.
// Deve ser usado SEMPRE depois do verifyToken, que preenche req.usuario.
function verificarPermissao(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !perfisPermitidos.includes(req.usuario.nivel_acesso)) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar este recurso.' });
    }
    next();
  };
}

module.exports = verificarPermissao;
