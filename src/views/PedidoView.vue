<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">Pedido — Mesa {{ mesa?.numero }}</h1>
      <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/home')">
        <i class="bi bi-arrow-left me-1"></i>Voltar
      </button>
    </div>

    <div class="row g-4">
      <!-- Coluna produtos -->
      <div class="col-lg-7">
        <ul class="nav nav-tabs mb-3">
          <li v-for="cat in produtosStore.categorias" :key="cat" class="nav-item">
            <button
              class="nav-link"
              :class="{ active: categoriaAtiva === cat }"
              @click="categoriaAtiva = cat"
            >
              {{ cat }}
            </button>
          </li>
        </ul>

        <div class="row g-2">
          <div
            v-for="produto in produtosStore.produtosPorCategoria(categoriaAtiva)"
            :key="produto.id"
            class="col-12 col-md-6"
          >
            <ProdutoCard :produto="produto" @adicionar="adicionarProduto" />
          </div>
        </div>
      </div>

      <!-- Coluna pedido atual -->
      <div class="col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Itens da mesa</h5>

            <div v-if="itens.length === 0" class="text-muted small py-3 text-center">
              Nenhum item adicionado ainda.
            </div>

            <ItemPedido
              v-for="item in itens"
              :key="item.produtoId"
              :item="item"
              @adicionar-unidade="pedidosStore.adicionarProduto(mesaId, buscarProduto(item.produtoId))"
              @remover-unidade="pedidosStore.removerUnidade(mesaId, item.produtoId)"
              @remover-produto="pedidosStore.removerProduto(mesaId, item.produtoId)"
            />

            <div class="d-flex justify-content-between mt-3 fw-bold fs-5">
              <span>Total</span>
              <span>R$ {{ total.toFixed(2) }}</span>
            </div>

            <button
              class="btn btn-success w-100 mt-3"
              :disabled="itens.length === 0"
              @click="enviarPedido"
            >
              <i class="bi bi-send-check me-1"></i>Enviar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMesasStore } from '../stores/mesas'
import { useProdutosStore } from '../stores/produtos'
import { usePedidosStore } from '../stores/pedidos'
import ProdutoCard from '../components/pedido/ProdutoCard.vue'
import ItemPedido from '../components/pedido/ItemPedido.vue'

const route = useRoute()
const router = useRouter()

const mesasStore = useMesasStore()
const produtosStore = useProdutosStore()
const pedidosStore = usePedidosStore()

const mesaId = route.params.mesaId
const mesa = computed(() => mesasStore.getMesaById(mesaId))

const categoriaAtiva = ref(produtosStore.categorias[0])

const itens = computed(() => pedidosStore.itensDaMesa(mesaId))
const total = computed(() => pedidosStore.totalDaMesa(mesaId))

function buscarProduto(produtoId) {
  return produtosStore.produtos.find((p) => p.id === produtoId)
}

function adicionarProduto(produto) {
  pedidosStore.adicionarProduto(mesaId, produto)
}

function enviarPedido() {
  pedidosStore.enviarPedido(mesaId)
  router.push('/home')
}
</script>
