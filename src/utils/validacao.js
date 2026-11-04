export function erroTexto(valor, limite, rotulo = 'nome') {
  const texto = String(valor ?? '').trim()
  return !texto
    ? `Informe o ${rotulo}.`
    : texto.length > limite
      ? `Use até ${limite} caracteres.`
      : ''
}

export function erroEmail(valor) {
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor ?? '').trim()) ||
    String(valor).trim().length > 150
    ? 'Informe um e-mail válido, com até 150 caracteres.'
    : ''
}

export function erroInteiro(valor) {
  return /^\d+$/.test(String(valor)) && Number(valor) > 0 && Number(valor) <= 2147483647
    ? ''
    : 'Informe um número inteiro entre 1 e 2147483647.'
}

export function erroDinheiro(valor) {
  return /^\d{1,6}(\.\d{1,2})?$/.test(String(valor).trim()) && Number(valor) > 0
    ? ''
    : 'Informe um valor entre 0,01 e 999.999,99, com até duas casas decimais.'
}

export function erroSenha(valor, editando = false) {
  if (editando && !valor) return ''
  return typeof valor !== 'string' ||
    valor.length < 6 ||
    new TextEncoder().encode(valor).length > 72
    ? 'Use pelo menos 6 caracteres e no máximo 72 bytes (acentos podem ocupar mais de um byte).'
    : ''
}

export const somenteErros = (campos) =>
  Object.fromEntries(Object.entries(campos).filter(([, mensagem]) => mensagem))
