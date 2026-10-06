import { defineStore } from 'pinia'
import api from '../services/api'

export const useMesasStore = defineStore('mesas', {
  state: () => ({
    mesas: [],
    carregando: false,
    erro: '',
  }),
  getters: {
    mesasDoSalao: (state) => state.mesas.filter((m) => m.status !== 'inativa'),
    getMesaById: (state) => (id) => state.mesas.find((m) => m.id === Number(id)),
  },
  actions: {
    async carregar() {
      this.carregando = true
      this.erro = ''
      try {
        const { data } = await api.get('/mesas')
        // normaliza para o formato usado pelas telas: { id, numero, status, consumo }
        this.mesas = data.map((m) => ({
          id: m.mesa_id,
          numero: m.numero,
          status: m.status,
          consumo: m.consumo,
        }))
      } catch (e) {
        this.erro = e.response?.data?.erro ?? 'Não foi possível carregar as mesas.'
      } finally {
        this.carregando = false
      }
    },

    // ---- TRANSITORIO (mock local): sai nos checkpoints 11.3, 11.4 e 11.6 ----
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
