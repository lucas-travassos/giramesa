import { defineStore } from 'pinia'
import api from '../services/api'

export const useProdutosStore = defineStore('produtos', {
  state: () => ({
    produtos: [],
    carregando: false,
    erro: '',
  }),
  getters: {
    produtosAtivos: (state) => state.produtos.filter((p) => p.status === 'ativo'),
    // abas do pedido: categorias com produto ativo, em ordem alfabetica
    categorias() {
      const nomes = new Set(this.produtosAtivos.map((p) => p.categoria))
      return [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    },
    produtosPorCategoria() {
      return (categoria) => this.produtosAtivos.filter((p) => p.categoria === categoria)
    },
  },
  actions: {
    async carregar() {
      this.carregando = true
      this.erro = ''
      try {
        const { data } = await api.get('/produtos')
        // normaliza: preco chega como texto ("6.00") e a categoria vem aninhada
        this.produtos = data.map((p) => ({
          id: p.produto_id,
          nome: p.nome,
          categoria: p.categoria?.nome ?? 'Sem categoria',
          preco: parseFloat(p.preco),
          status: p.status,
        }))
      } catch (e) {
        this.erro = e.response?.data?.erro ?? 'Não foi possível carregar os produtos.'
      } finally {
        this.carregando = false
      }
    },

    // ---- TRANSITORIO (mock local): sai no checkpoint 11.7 ----
    adicionarOuEditar(dados) {
      if (dados.id) {
        const idx = this.produtos.findIndex((p) => p.id === dados.id)
        if (idx !== -1) this.produtos[idx] = { ...dados }
        return
      }
      const novoId = Math.max(0, ...this.produtos.map((p) => p.id)) + 1
      this.produtos.push({ ...dados, id: novoId })
    },
    remover(id) {
      this.produtos = this.produtos.filter((p) => p.id !== id)
    },
  },
})
