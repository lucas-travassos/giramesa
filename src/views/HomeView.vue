<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h4 mb-0">Salão — Mesas</h1>
      <button
        class="btn btn-sm btn-outline-secondary"
        :disabled="mesasStore.carregando"
        @click="mesasStore.carregar()"
      >
        <i aria-hidden="true" class="bi bi-arrow-clockwise me-1"></i>Atualizar
      </button>
    </div>

    <div v-if="aviso" class="alert alert-warning alert-dismissible" role="alert">
      {{ aviso }}
      <button
        type="button"
        class="btn-close"
        aria-label="Fechar mensagem"
        @click="aviso = ''"
      ></button>
    </div>

    <EstadoConteudo
      :carregando="mesasStore.carregando"
      :erro="mesasStore.erro"
      :vazio="!mesasStore.mesasDoSalao.length"
      mensagem-vazio="Nenhuma mesa disponível no salão."
      @recarregar="mesasStore.carregar()"
    >
      <div class="row g-3">
        <div v-for="mesa in mesasStore.mesasDoSalao" :key="mesa.id" class="col-6 col-md-4 col-lg-3">
          <MesaCard
            :mesa="mesa"
            @abrir-pedido="irParaPedido"
            @fechar-conta="iniciarFechamento"
            @abrir-checkout="irParaCheckout"
            @aguardar="avisarCaixa"
          />
        </div>
      </div>
    </EstadoConteudo>
  </div>
</template>

<script setup>
import EstadoConteudo from '../components/EstadoConteudo.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
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
onBeforeUnmount(() => clearTimeout(timer))

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
