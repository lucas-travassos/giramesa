import { defineStore } from 'pinia'
import api from '../services/api'

export const usePedidosStore = defineStore('pedidos', {
  state: () => ({
    itensPorMesa: {}, // carrinho local: itens novos, ainda nao enviados
  }),
  getters: {
    itensDaMesa: (state) => (mesaId) => state.itensPorMesa[mesaId] || [],
    totalDaMesa: (state) => (mesaId) => {
      const itens = state.itensPorMesa[mesaId] || []
      return itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
    },
  },
  actions: {
    // ---- carrinho local ----
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
    },
    removerProduto(mesaId, produtoId) {
      if (!this.itensPorMesa[mesaId]) return
      this.itensPorMesa[mesaId] = this.itensPorMesa[mesaId].filter(
        (i) => i.produtoId !== produtoId
      )
    },

    // ---- pedido (API) ----
    async buscarPedidoPorStatus(mesaId, status) {
      const { data } = await api.get('/pedidos', { params: { mesa_id: mesaId, status } })
      return data[0] ?? null
    },
    buscarPedidoAberto(mesaId) {
      return this.buscarPedidoPorStatus(mesaId, 'aberto')
    },
    buscarPedidoEmFechamento(mesaId) {
      return this.buscarPedidoPorStatus(mesaId, 'em_fechamento')
    },

    // POST /pedidos = "abrir ou buscar": cria se a mesa esta disponivel,
    // devolve o pedido aberto se ja esta ocupada (seguro para reenvio)
    async enviarPedido(mesaId) {
      const { data: pedido } = await api.post('/pedidos', { mesa_id: Number(mesaId) })

      for (const item of [...this.itensDaMesa(mesaId)]) {
        await api.post(`/pedidos/${pedido.pedido_id}/itens`, {
          produto_id: item.produtoId,
          quantidade: item.quantidade,
        })
        // sai do carrinho so depois de gravado: se falhar no meio, o reenvio nao duplica
        this.removerProduto(mesaId, item.produtoId)
      }
    },

    // ---- fechamento e pagamentos (API) ----
    async iniciarFechamento(mesaId) {
      const pedido = await this.buscarPedidoAberto(mesaId)
      if (!pedido) throw new Error('Nenhum pedido aberto encontrado para esta mesa.')
      await api.post(`/pedidos/${pedido.pedido_id}/fechar`)
    },
    async listarPagamentos(pedidoId) {
      const { data } = await api.get(`/pedidos/${pedidoId}/pagamentos`)
      return data
    },
    async registrarPagamento(pedidoId, formaPagamento, valor) {
      const { data } = await api.post(`/pedidos/${pedidoId}/pagamentos`, {
        forma_pagamento: formaPagamento,
        valor,
      })
      return data // { pedido, pagamentos, saldo_restante }
    },
    async cancelarFechamento(pedidoId) {
      await api.post(`/pedidos/${pedidoId}/cancelar-fechamento`)
    },
  },
})
