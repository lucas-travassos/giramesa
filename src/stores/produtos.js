import { defineStore } from 'pinia'
import api from '../services/api'
import { mensagemErro } from '../utils/erro'

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
          categoriaId: p.categoria_id,
          descricao: p.descricao,
          preco: parseFloat(p.preco),
          status: p.status,
          temHistorico: p.tem_historico,
        }))
      } catch (e) {
        this.erro = mensagemErro(e, 'Não foi possível carregar os produtos.')
      } finally {
        this.carregando = false
      }
    },

    // Cadastro (admin): lanca erro se a API recusar; o CrudManager mostra a mensagem
    async salvar(dados) {
      const corpo = {
        categoria_id: Number(dados.categoriaId),
        nome: dados.nome.trim(),
        descricao: (dados.descricao ?? '').trim(),
        preco: Math.round(Number(dados.preco) * 100) / 100,
        status: dados.status,
      }
      if (dados.id) await api.put(`/produtos/${dados.id}`, corpo)
      else await api.post('/produtos', corpo)
      await this.carregar()
    },

    async inativar(id) {
      await api.delete(`/produtos/${id}`)
      await this.carregar()
    },
  },
})
