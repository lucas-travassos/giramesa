// Fonte unica de cores e rotulos por status de mesa
// (Salao, Pedido e Checkout reaproveitam)
export const STATUS_MESA = {
  disponivel: { label: 'Disponível', badge: 'bg-success', borda: 'border-success' },
  ocupada: { label: 'Ocupada', badge: 'bg-danger', borda: 'border-danger' },
  caixa: { label: 'Em fechamento', badge: 'bg-warning text-dark', borda: 'border-warning' },
  inativa: { label: 'Inativa', badge: 'bg-secondary', borda: 'border-secondary' },
}
