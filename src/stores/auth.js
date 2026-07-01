import { defineStore } from 'pinia'

const USUARIOS_FAKE = [
  { usuario: 'garcom', senha: '123456', nome: 'João Garçom', perfil: 'garcom' },
  { usuario: 'caixa', senha: '123456', nome: 'Maria Caixa', perfil: 'caixa' },
  { usuario: 'admin', senha: '123456', nome: 'Lucas Admin', perfil: 'admin' },
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuarioLogado: null,
  }),
  getters: {
    estaLogado: (state) => !!state.usuarioLogado,
    perfil: (state) => state.usuarioLogado?.perfil ?? null,
  },
  actions: {
    login(usuario, senha) {
      const encontrado = USUARIOS_FAKE.find(
        (u) => u.usuario === usuario && u.senha === senha
      )
      if (!encontrado) return false

      this.usuarioLogado = { nome: encontrado.nome, perfil: encontrado.perfil }
      return true
    },
    logout() {
      this.usuarioLogado = null
    },
  },
})
