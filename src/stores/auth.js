import { defineStore } from 'pinia'
import { login as loginApi } from '../services/authService'
import { lerSessao, salvarSessao, limparSessao } from '../services/session'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const sessao = lerSessao()
    return {
      token: sessao?.token ?? null,
      usuarioLogado: sessao?.usuario ?? null,
    }
  },
  getters: {
    estaLogado: (state) => !!state.token,
    perfil: (state) => state.usuarioLogado?.nivel_acesso ?? null,
  },
  actions: {
    // Lanca erro se a API recusar; quem chama trata a mensagem
    async login(email, senha) {
      const { token, usuario } = await loginApi(email, senha)
      this.token = token
      this.usuarioLogado = usuario
      salvarSessao({ token, usuario })
    },
    logout() {
      this.token = null
      this.usuarioLogado = null
      limparSessao()
    },
  },
})
