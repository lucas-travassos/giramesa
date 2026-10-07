<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">Fechamento — Mesa {{ pedido?.Mesa?.numero }}</h1>
      <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/home')">
        <i class="bi bi-arrow-left me-1"></i>Salão
      </button>
    </div>

    <div v-if="carregando" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div
      v-else-if="erroCarga"
      class="alert alert-danger d-flex justify-content-between align-items-center"
    >
      <span>{{ erroCarga }}</span>
      <button class="btn btn-sm btn-outline-danger" @click="carregarTela">Tentar de novo</button>
    </div>

    <div v-else class="row g-4">
      <!-- Resumo do consumo -->
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Resumo do consumo</h5>

            <div
              v-for="item in itens"
              :key="item.id"
              class="d-flex justify-content-between py-2 border-bottom small"
            >
              <span>{{ item.quantidade }}x {{ item.nome }}</span>
              <span>R$ {{ (item.preco * item.quantidade).toFixed(2) }}</span>
            </div>

            <div class="d-flex justify-content-between mt-3 fw-bold fs-5">
              <span>Total</span>
              <span>R$ {{ (totalCentavos / 100).toFixed(2) }}</span>
            </div>

            <template v-if="pagamentos.length">
              <h6 class="mt-4 mb-2">Pagamentos registrados</h6>
              <div
                v-for="pg in pagamentos"
                :key="pg.pagamento_id"
                class="d-flex justify-content-between small py-1 border-bottom"
              >
                <span><i class="bi bi-check-circle-fill text-success me-1"></i>{{ rotuloForma(pg.forma_pagamento) }}</span>
                <span>R$ {{ parseFloat(pg.valor).toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between mt-2 fw-semibold">
                <span>Saldo restante</span>
                <span>R$ {{ (saldoCentavos / 100).toFixed(2) }}</span>
              </div>
            </template>

            <button
              class="btn btn-outline-secondary btn-sm mt-4"
              :disabled="pagamentos.length > 0 || processando"
              @click="reabrirPedido"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reabrir pedido
            </button>
            <small v-if="pagamentos.length" class="text-muted ms-2">
              Só é possível reabrir antes do primeiro pagamento.
            </small>
          </div>
        </div>
      </div>

      <!-- Divisão e pagamento -->
      <div class="col-lg-5">
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <h5 class="card-title">Divisão da conta</h5>
            <label class="form-label small">Quantas pessoas ainda vão pagar?</label>
            <input v-model.number="pessoasRestantes" type="number" min="1" class="form-control mb-2" />
            <p class="mb-0 text-muted small">
              Valor sugerido por pessoa:
              <span class="fw-semibold text-dark">R$ {{ valorSugerido.toFixed(2) }}</span>
            </p>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Pagamento</h5>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <button
                v-for="forma in FORMAS"
                :key="forma.valor"
                type="button"
                class="btn btn-sm"
                :class="formaSelecionada === forma.valor ? 'btn-primary' : 'btn-outline-primary'"
                @click="formaSelecionada = forma.valor"
              >
                {{ forma.rotulo }}
              </button>
            </div>

            <label class="form-label small">Valor deste pagamento</label>
            <div class="input-group mb-3">
              <span class="input-group-text">R$</span>
              <input v-model.number="valorPagamento" type="number" min="0.01" step="0.01" class="form-control" />
            </div>

            <div v-if="erroPagamento" class="alert alert-danger py-2 small">{{ erroPagamento }}</div>

            <button class="btn btn-success w-100" :disabled="!podeRegistrar" @click="registrarPagamento">
              <span v-if="processando" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-check-circle me-1"></i>
              {{ processando ? 'Registrando...' : 'Registrar pagamento' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePedidosStore } from '../stores/pedidos'
import { mensagemErro } from '../utils/erro'

const FORMAS = [
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'debito', rotulo: 'Débito' },
  { valor: 'credito', rotulo: 'Crédito' },
  { valor: 'pix', rotulo: 'Pix' },
]
const rotuloForma = (valor) => FORMAS.find((f) => f.valor === valor)?.rotulo ?? valor

const route = useRoute()
const router = useRouter()
const pedidosStore = usePedidosStore()
const mesaId = Number(route.params.mesaId)

const pedido = ref(null)
const pagamentos = ref([])
const carregando = ref(true)
const erroCarga = ref('')
const processando = ref(false)
const erroPagamento = ref('')

const pessoasRestantes = ref(1)
const formaSelecionada = ref(null)
const valorPagamento = ref(0)

// todos os calculos em centavos, para a divisao nunca perder 1 centavo
const centavos = (v) => Math.round(parseFloat(v) * 100)
const totalCentavos = computed(() => (pedido.value ? centavos(pedido.value.valor_total) : 0))
const pagoCentavos = computed(() => pagamentos.value.reduce((s, p) => s + centavos(p.valor), 0))
const saldoCentavos = computed(() => totalCentavos.value - pagoCentavos.value)

// a ultima pessoa paga a diferenca (pessoasRestantes = 1 => saldo inteiro)
const valorSugerido = computed(() => {
  const n = Math.max(pessoasRestantes.value || 1, 1)
  const parte = n === 1 ? saldoCentavos.value : Math.floor(saldoCentavos.value / n)
  return parte / 100
})
watch(valorSugerido, (v) => (valorPagamento.value = v), { immediate: true })

const itens = computed(() =>
  (pedido.value?.ItemPedidos ?? [])
    .map((i) => ({
      id: i.item_id,
      nome: i.Produto?.nome ?? 'Produto',
      quantidade: i.quantidade,
      preco: parseFloat(i.preco_unitario),
    }))
    .sort((a, b) => a.id - b.id)
)

const podeRegistrar = computed(() => {
  const c = Math.round((valorPagamento.value || 0) * 100)
  return !!formaSelecionada.value && c > 0 && c <= saldoCentavos.value && !processando.value
})

async function carregarTela() {
  carregando.value = true
  erroCarga.value = ''
  try {
    const p = await pedidosStore.buscarPedidoEmFechamento(mesaId)
    if (!p) {
      router.replace('/home')
      return
    }
    pedido.value = p
    const dados = await pedidosStore.listarPagamentos(p.pedido_id)
    pagamentos.value = dados.pagamentos
  } catch (e) {
    erroCarga.value = mensagemErro(e, 'Não foi possível carregar o fechamento da mesa.')
  } finally {
    carregando.value = false
  }
}

async function registrarPagamento() {
  processando.value = true
  erroPagamento.value = ''
  try {
    const resp = await pedidosStore.registrarPagamento(
      pedido.value.pedido_id,
      formaSelecionada.value,
      Math.round(valorPagamento.value * 100) / 100
    )
    if (resp.pedido.status === 'finalizado') {
      router.push('/home') // saldo zerado: o servidor ja liberou a mesa
      return
    }
    pagamentos.value = resp.pagamentos
    formaSelecionada.value = null
    pessoasRestantes.value = Math.max(pessoasRestantes.value - 1, 1)
  } catch (e) {
    erroPagamento.value = mensagemErro(e, 'Não foi possível registrar o pagamento.')
  } finally {
    processando.value = false
  }
}

async function reabrirPedido() {
  processando.value = true
  erroPagamento.value = ''
  try {
    await pedidosStore.cancelarFechamento(pedido.value.pedido_id)
    router.push(`/pedido/${mesaId}`)
  } catch (e) {
    erroPagamento.value = mensagemErro(e, 'Não foi possível reabrir o pedido.')
  } finally {
    processando.value = false
  }
}

onMounted(carregarTela)
</script>
