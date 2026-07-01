import { defineStore } from 'pinia'

export const useMesasStore = defineStore('mesas', {
  state: () => ({
    mesas: [
      { id: 1, numero: 1, status: 'disponivel', consumo: 0 },
      { id: 2, numero: 2, status: 'ocupada', consumo: 87.5 },
      { id: 3, numero: 3, status: 'ocupada', consumo: 142.9 },
      { id: 4, numero: 4, status: 'caixa', consumo: 63.0 },
      { id: 5, numero: 5, status: 'disponivel', consumo: 0 },
      { id: 6, numero: 6, status: 'disponivel', consumo: 0 },
      { id: 7, numero: 7, status: 'ocupada', consumo: 45.0 },
      { id: 8, numero: 8, status: 'disponivel', consumo: 0 },
    ],
  }),
  getters: {
    getMesaById: (state) => (id) => state.mesas.find((m) => m.id === Number(id)),
  },
  actions: {
    atualizarStatus(id, novoStatus) {
      const mesa = this.mesas.find((m) => m.id === Number(id))
      if (mesa) mesa.status = novoStatus
    },
    fecharMesa(id) {
      const mesa = this.mesas.find((m) => m.id === Number(id))
      if (mesa) {
        mesa.status = 'disponivel'
        mesa.consumo = 0
      }
    },
    adicionarOuEditar(dados) {
      if (dados.id) {
        const idx = this.mesas.findIndex((m) => m.id === dados.id)
        if (idx !== -1) this.mesas[idx] = { ...this.mesas[idx], numero: dados.numero }
        return
      }
      const novoId = Math.max(0, ...this.mesas.map((m) => m.id)) + 1
      this.mesas.push({ id: novoId, numero: dados.numero, status: 'disponivel', consumo: 0 })
    },
    remover(id) {
      this.mesas = this.mesas.filter((m) => m.id !== id)
    },
  },
})
