<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">Salão — Mesas</h1>

    <div class="row g-3">
      <div
        v-for="mesa in mesasStore.mesas"
        :key="mesa.id"
        class="col-6 col-md-4 col-lg-3"
      >
        <MesaCard :mesa="mesa" @clicar="handleClickMesa" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useMesasStore } from '../stores/mesas'
import MesaCard from '../components/mesa/MesaCard.vue'

const router = useRouter()
const mesasStore = useMesasStore()

function handleClickMesa(mesa) {
  if (mesa.status === 'caixa') {
    alert('Esta mesa está em fechamento. Aguarde até que fique disponível novamente.')
    return
  }

  router.push(`/pedido/${mesa.id}`)
}
</script>
