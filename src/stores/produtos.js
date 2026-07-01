import { defineStore } from 'pinia'

export const useProdutosStore = defineStore('produtos', {
  state: () => ({
    categorias: ['Refrigerantes', 'Sucos', 'Pizzas', 'Hambúrgueres'],
    produtos: [
      { id: 1, nome: 'Coca-Cola 350ml', categoria: 'Refrigerantes', preco: 6.0 },
      { id: 2, nome: 'Guaraná 350ml', categoria: 'Refrigerantes', preco: 6.0 },
      { id: 3, nome: 'Sprite 350ml', categoria: 'Refrigerantes', preco: 6.0 },
      { id: 4, nome: 'Suco de Laranja', categoria: 'Sucos', preco: 8.5 },
      { id: 5, nome: 'Suco de Uva', categoria: 'Sucos', preco: 8.5 },
      { id: 6, nome: 'Limonada', categoria: 'Sucos', preco: 7.0 },
      { id: 7, nome: 'Pizza Margherita', categoria: 'Pizzas', preco: 45.0 },
      { id: 8, nome: 'Pizza Calabresa', categoria: 'Pizzas', preco: 48.0 },
      { id: 9, nome: 'Pizza 4 Queijos', categoria: 'Pizzas', preco: 52.0 },
      { id: 10, nome: 'Hambúrguer Clássico', categoria: 'Hambúrgueres', preco: 28.0 },
      { id: 11, nome: 'Hambúrguer Bacon', categoria: 'Hambúrgueres', preco: 32.0 },
      { id: 12, nome: 'Hambúrguer Vegetariano', categoria: 'Hambúrgueres', preco: 30.0 },
    ],
  }),
  getters: {
    produtosPorCategoria: (state) => (categoria) =>
      state.produtos.filter((p) => p.categoria === categoria),
  },
})
