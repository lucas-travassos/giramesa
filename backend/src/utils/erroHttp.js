class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function exigir(condicao, status, mensagem) {
  if (!condicao) throw new ErroHttp(status, mensagem);
}

module.exports = { ErroHttp, exigir };
