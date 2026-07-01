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
      const mesa = this.mesas.find((m) => m.id === id)
      if (mesa) mesa.status = novoStatus
    },
  },
})
