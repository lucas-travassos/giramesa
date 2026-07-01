import { defineStore } from 'pinia'
import { useMesasStore } from './mesas'

export const usePedidosStore = defineStore('pedidos', {
  state: () => ({
    // itensPorMesa: { [mesaId]: [{ produtoId, nome, preco, quantidade }] }
    itensPorMesa: {},
  }),
  getters: {
    itensDaMesa: (state) => (mesaId) => state.itensPorMesa[mesaId] || [],
    totalDaMesa: (state) => (mesaId) => {
      const itens = state.itensPorMesa[mesaId] || []
      return itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
    },
  },
  actions: {
    adicionarProduto(mesaId, produto) {
      if (!this.itensPorMesa[mesaId]) this.itensPorMesa[mesaId] = []

      const itens = this.itensPorMesa[mesaId]
      const existente = itens.find((i) => i.produtoId === produto.id)

      if (existente) {
        existente.quantidade++
      } else {
        itens.push({
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
        })
      }

      this.sincronizarConsumo(mesaId)
    },
    removerUnidade(mesaId, produtoId) {
      const itens = this.itensPorMesa[mesaId]
      if (!itens) return

      const item = itens.find((i) => i.produtoId === produtoId)
      if (!item) return

      item.quantidade--
      if (item.quantidade <= 0) {
        this.itensPorMesa[mesaId] = itens.filter((i) => i.produtoId !== produtoId)
      }

      this.sincronizarConsumo(mesaId)
    },
    removerProduto(mesaId, produtoId) {
      if (!this.itensPorMesa[mesaId]) return
      this.itensPorMesa[mesaId] = this.itensPorMesa[mesaId].filter(
        (i) => i.produtoId !== produtoId
      )
      this.sincronizarConsumo(mesaId)
    },
    sincronizarConsumo(mesaId) {
      const mesasStore = useMesasStore()
      const mesa = mesasStore.getMesaById(mesaId)
      if (mesa) mesa.consumo = this.totalDaMesa(mesaId)
    },
    enviarPedido(mesaId) {
      const mesasStore = useMesasStore()
      mesasStore.atualizarStatus(Number(mesaId), 'ocupada')
    },
  },
})
