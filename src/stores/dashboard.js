import { defineStore } from 'pinia'

function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    faturamentoDia: aleatorio(1800, 4200),
    totalPedidos: aleatorio(35, 90),
    vendasPorCategoria: {
      Refrigerantes: aleatorio(200, 600),
      Sucos: aleatorio(150, 450),
      Pizzas: aleatorio(800, 1800),
      Hambúrgueres: aleatorio(600, 1500),
    },
    faturamentoSemana: [
      { dia: 'Seg', valor: aleatorio(1500, 3500) },
      { dia: 'Ter', valor: aleatorio(1500, 3500) },
      { dia: 'Qua', valor: aleatorio(1500, 3500) },
      { dia: 'Qui', valor: aleatorio(1500, 3500) },
      { dia: 'Sex', valor: aleatorio(2000, 4500) },
      { dia: 'Sáb', valor: aleatorio(3000, 6000) },
      { dia: 'Dom', valor: aleatorio(2500, 5500) },
    ],
  }),
  getters: {
    ticketMedio: (state) =>
      (state.faturamentoDia / (state.totalPedidos || 1)).toFixed(2),
  },
})
