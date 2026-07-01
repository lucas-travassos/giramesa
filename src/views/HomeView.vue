<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">Salão — Mesas</h1>

    <div class="row g-3">
      <div
        v-for="mesa in mesasStore.mesas"
        :key="mesa.id"
        class="col-6 col-md-4 col-lg-3"
      >
        <MesaCard
          :mesa="mesa"
          @abrir-pedido="irParaPedido"
          @fechar-conta="irParaCheckout"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useMesasStore } from '../stores/mesas'
import { usePedidosStore } from '../stores/pedidos'
import MesaCard from '../components/mesa/MesaCard.vue'

const router = useRouter()
const mesasStore = useMesasStore()
const pedidosStore = usePedidosStore()

function irParaPedido(mesa) {
  router.push(`/pedido/${mesa.id}`)
}

function irParaCheckout(mesa) {
  pedidosStore.iniciarFechamento(mesa.id)
  router.push(`/checkout/${mesa.id}`)
}
</script>
