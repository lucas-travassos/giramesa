import { defineStore } from 'pinia'

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    usuarios: [
      { id: 1, nome: 'João Garçom', usuario: 'garcom', perfil: 'garcom' },
      { id: 2, nome: 'Maria Caixa', usuario: 'caixa', perfil: 'caixa' },
      { id: 3, nome: 'Lucas Admin', usuario: 'admin', perfil: 'admin' },
    ],
  }),
  actions: {
    adicionarOuEditar(dados) {
      if (dados.id) {
        const idx = this.usuarios.findIndex((u) => u.id === dados.id)
        if (idx !== -1) this.usuarios[idx] = { ...dados }
        return
      }
      const novoId = Math.max(0, ...this.usuarios.map((u) => u.id)) + 1
      this.usuarios.push({ ...dados, id: novoId })
    },
    remover(id) {
      this.usuarios = this.usuarios.filter((u) => u.id !== id)
    },
  },
})
