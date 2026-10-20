import { defineStore } from 'pinia'
import api from '../services/api'
import { mensagemErro } from '../utils/erro'

const dadosVazios = () => ({
  dataReferencia: '',
  faturamentoDia: 0,
  totalPedidos: 0,
  ticketMedio: 0,
  faturamentoSemana: [],
  vendasPorCategoria: [],
  vendasPorFormaPagamento: [],
})

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({ ...dadosVazios(), carregando: false, erro: '' }),
  actions: {
    async carregar() {
      this.carregando = true
      this.erro = ''
      Object.assign(this, dadosVazios())
      try {
        const { data } = await api.get('/dashboard')
        this.dataReferencia = data.data_referencia
        this.faturamentoDia = data.faturamento_dia
        this.totalPedidos = data.total_pedidos
        this.ticketMedio = data.ticket_medio
        this.faturamentoSemana = data.faturamento_semana
        this.vendasPorCategoria = data.vendas_por_categoria
        this.vendasPorFormaPagamento = data.vendas_por_forma_pagamento
      } catch (e) {
        this.erro = mensagemErro(
          e,
          'Não foi possível carregar o dashboard. Verifique a conexão e tente novamente.',
        )
      } finally {
        this.carregando = false
      }
    },
  },
})
