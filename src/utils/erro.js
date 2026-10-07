// Mensagem amigavel para erros de API: usa a do backend quando existe
export function mensagemErro(e, padrao) {
  return e.response?.data?.erro ?? (e.isAxiosError ? padrao : e.message)
}
