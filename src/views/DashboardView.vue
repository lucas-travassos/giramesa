<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">Dashboard Financeiro</h1>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <i class="bi bi-cash-coin fs-2 text-success"></i>
            <p class="text-muted small mb-0 mt-2">Faturamento do dia</p>
            <h3 class="mb-0">R$ {{ dashboardStore.faturamentoDia.toFixed(2) }}</h3>
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
            <h3 class="mb-0">R$ {{ dashboardStore.ticketMedio }}</h3>
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
            <h5 class="card-title">Vendas por categoria</h5>
            <Doughnut :data="dadosRosca" :options="opcoesGrafico" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  ArcElement
)

const dashboardStore = useDashboardStore()

const dadosLinha = computed(() => ({
  labels: dashboardStore.faturamentoSemana.map((d) => d.dia),
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
  labels: Object.keys(dashboardStore.vendasPorCategoria),
  datasets: [
    {
      data: Object.values(dashboardStore.vendasPorCategoria),
      backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'],
    },
  ],
}))

const opcoesGrafico = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } },
}
</script>
