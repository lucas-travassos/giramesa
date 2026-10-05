const CHAVE = 'giramesa_sessao'

export function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE))
  } catch {
    return null
  }
}

export function salvarSessao(sessao) {
  localStorage.setItem(CHAVE, JSON.stringify(sessao))
}

export function limparSessao() {
  localStorage.removeItem(CHAVE)
}
