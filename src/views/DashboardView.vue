<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h4 mb-0">Dashboard Financeiro</h1>
      <button
        class="btn btn-outline-primary btn-sm"
        :disabled="dashboardStore.carregando"
        @click="dashboardStore.carregar()"
      >
        Atualizar
      </button>
    </div>

    <div v-if="dashboardStore.carregando" class="text-center py-5" role="status">
      <span class="spinner-border text-primary" aria-hidden="true"></span>
      <p class="mt-2">Carregando dashboard...</p>
    </div>
    <div v-else-if="dashboardStore.erro" class="alert alert-danger" role="alert">
      <p>{{ dashboardStore.erro }}</p>
      <button class="btn btn-outline-danger btn-sm" @click="dashboardStore.carregar()">
        Tentar de novo
      </button>
    </div>

    <template v-else>
      <p class="text-muted small">
        {{ formatarData(dashboardStore.dataReferencia) }} · Horário de São Paulo. Somente pedidos
        finalizados, pela data de fechamento.
      </p>
      <div v-if="!dashboardStore.totalPedidos" class="alert alert-info">
        Nenhum pedido finalizado hoje.
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <i class="bi bi-cash-coin fs-2 text-success"></i>
              <p class="text-muted small mb-0 mt-2">Faturamento do dia</p>
              <h3 class="mb-0">{{ moeda(dashboardStore.faturamentoDia) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <i class="bi bi-receipt fs-2 text-primary"></i>
              <p class="text-muted small mb-0 mt-2">Pedidos no dia</p>
              <h3 class="mb-0">{{ dashboardStore.totalPedidos }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <i class="bi bi-graph-up-arrow fs-2 text-warning"></i>
              <p class="text-muted small mb-0 mt-2">Ticket médio</p>
              <h3 class="mb-0">{{ moeda(dashboardStore.ticketMedio) }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Faturamento — últimos 7 dias</h5>
              <Line :data="dadosLinha" :options="opcoesGrafico" />
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Vendas por categoria — hoje</h5>
              <Doughnut
                v-if="dashboardStore.vendasPorCategoria.length"
                :data="dadosRosca"
                :options="opcoesGrafico"
              />
              <p v-else class="text-muted mb-0">Nenhuma venda por categoria hoje.</p>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Vendas por forma de pagamento — hoje</h5>
              <Doughnut
                v-if="dashboardStore.vendasPorFormaPagamento.length"
                :data="dadosPagamentos"
                :options="opcoesGrafico"
              />
              <p v-else class="text-muted mb-0">Nenhum pagamento de pedido finalizado hoje.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler,
} from 'chart.js'
import { useDashboardStore } from '../stores/dashboard'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler,
)

const dashboardStore = useDashboardStore()
onMounted(() => dashboardStore.carregar())

const moeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
const formatarData = (data) => (data ? data.split('-').reverse().join('/') : '')
const cores = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', '#0dcaf0']
const formasPagamento = { dinheiro: 'Dinheiro', debito: 'Débito', credito: 'Crédito', pix: 'Pix' }

const dadosLinha = computed(() => ({
  labels: dashboardStore.faturamentoSemana.map((d) => formatarData(d.dia)),
  datasets: [
    {
      label: 'Faturamento (R$)',
      data: dashboardStore.faturamentoSemana.map((d) => d.valor),
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13,110,253,0.15)',
      tension: 0.3,
      fill: true,
    },
  ],
}))

const dadosRosca = computed(() => ({
  labels: dashboardStore.vendasPorCategoria.map((c) => c.categoria),
  datasets: [
    {
      data: dashboardStore.vendasPorCategoria.map((c) => c.valor),
      backgroundColor: dashboardStore.vendasPorCategoria.map(
        (_, indice) => cores[indice % cores.length],
      ),
    },
  ],
}))

const dadosPagamentos = computed(() => ({
  labels: dashboardStore.vendasPorFormaPagamento.map((p) => formasPagamento[p.forma_pagamento]),
  datasets: [
    {
      data: dashboardStore.vendasPorFormaPagamento.map((p) => p.valor),
      backgroundColor: cores,
    },
  ],
}))

const opcoesGrafico = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } },
}
</script>
