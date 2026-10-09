import { defineStore } from 'pinia'
import api from '../services/api'
import { mensagemErro } from '../utils/erro'

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
          temHistorico: m.tem_historico,
        }))
      } catch (e) {
        this.erro = mensagemErro(e, 'Não foi possível carregar as mesas.')
      } finally {
        this.carregando = false
      }
    },

    // Cadastro (admin): lanca erro se a API recusar; o CrudManager mostra a mensagem
    async salvar(dados) {
      const numero = Number(dados.numero)
      if (dados.id) await api.put(`/mesas/${dados.id}`, { numero, status: dados.status })
      else await api.post('/mesas', { numero })
      await this.carregar()
    },

    async inativar(id) {
      await api.delete(`/mesas/${id}`)
      await this.carregar()
    },
  },
})
