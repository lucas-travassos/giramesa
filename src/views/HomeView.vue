<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h4 mb-0">Salão — Mesas</h1>
      <button
        class="btn btn-sm btn-outline-secondary"
        :disabled="mesasStore.carregando"
        @click="mesasStore.carregar()"
      >
        <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
      </button>
    </div>

    <div v-if="aviso" class="alert alert-warning alert-dismissible">
      {{ aviso }}
      <button type="button" class="btn-close" @click="aviso = ''"></button>
    </div>

    <div v-if="mesasStore.carregando && !mesasStore.mesas.length" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div
      v-else-if="mesasStore.erro"
      class="alert alert-danger d-flex justify-content-between align-items-center"
    >
      <span>{{ mesasStore.erro }}</span>
      <button class="btn btn-sm btn-outline-danger" @click="mesasStore.carregar()">
        Tentar de novo
      </button>
    </div>

    <p v-else-if="!mesasStore.mesasDoSalao.length" class="text-muted text-center py-5">
      Nenhuma mesa cadastrada.
    </p>

    <div v-else class="row g-3">
      <div
        v-for="mesa in mesasStore.mesasDoSalao"
        :key="mesa.id"
        class="col-6 col-md-4 col-lg-3"
      >
        <MesaCard
          :mesa="mesa"
          @abrir-pedido="irParaPedido"
          @fechar-conta="iniciarFechamento"
          @abrir-checkout="irParaCheckout"
          @aguardar="avisarCaixa"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMesasStore } from '../stores/mesas'
import { usePedidosStore } from '../stores/pedidos'
import { mensagemErro } from '../utils/erro'
import MesaCard from '../components/mesa/MesaCard.vue'

const router = useRouter()
const mesasStore = useMesasStore()
const pedidosStore = usePedidosStore()
const aviso = ref('')
let timer = null

onMounted(() => mesasStore.carregar())

function avisar(texto) {
  aviso.value = texto
  clearTimeout(timer)
  timer = setTimeout(() => (aviso.value = ''), 4000)
}

function irParaPedido(mesa) {
  router.push(`/pedido/${mesa.id}`)
}

function irParaCheckout(mesa) {
  router.push(`/checkout/${mesa.id}`)
}

async function iniciarFechamento(mesa) {
  try {
    await pedidosStore.iniciarFechamento(mesa.id)
    router.push(`/checkout/${mesa.id}`)
  } catch (e) {
    avisar(mensagemErro(e, 'Não foi possível iniciar o fechamento da conta.'))
    mesasStore.carregar()
  }
}

function avisarCaixa(mesa) {
  avisar(`A Mesa ${mesa.numero} está em fechamento. Aguarde até que fique disponível.`)
}
</script>
