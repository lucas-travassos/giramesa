import { defineStore } from 'pinia'
import api from '../services/api'
import { mensagemErro } from '../utils/erro'

const normalizar = (c) => ({ id: c.categoria_id, nome: c.nome })

export const useCategoriasStore = defineStore('categorias', {
  state: () => ({
    categorias: [],
    carregando: false,
    erro: '',
  }),
  actions: {
    async carregar() {
      this.carregando = true
      this.erro = ''
      try {
        const { data } = await api.get('/categorias')
        this.categorias = data.map(normalizar)
      } catch (e) {
        this.erro = mensagemErro(e, 'Não foi possível carregar as categorias.')
      } finally {
        this.carregando = false
      }
    },

    async salvar(dados) {
      const corpo = { nome: dados.nome.trim() }
      if (dados.id) await api.put(`/categorias/${dados.id}`, corpo)
      else await api.post('/categorias', corpo)
      await this.carregar()
    },

    // exclusao real: o servidor so permite se nao houver produtos vinculados
    async remover(id) {
      await api.delete(`/categorias/${id}`)
      await this.carregar()
    },
  },
})
