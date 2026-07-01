<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">Fechamento — Mesa {{ mesa?.numero }}</h1>
      <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/home')">
        <i class="bi bi-arrow-left me-1"></i>Voltar
      </button>
    </div>

    <div class="row g-4">
      <!-- Resumo do consumo -->
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Resumo do consumo</h5>

            <div
              v-for="item in itens"
              :key="item.produtoId"
              class="d-flex justify-content-between py-2 border-bottom small"
            >
              <span>{{ item.quantidade }}x {{ item.nome }}</span>
              <span>R$ {{ (item.preco * item.quantidade).toFixed(2) }}</span>
            </div>

            <div class="d-flex justify-content-between mt-3 fw-bold fs-5">
              <span>Total</span>
              <span>R$ {{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divisão e pagamento -->
      <div class="col-lg-5">
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <h5 class="card-title">Divisão da conta</h5>
            <label class="form-label small">Dividir entre quantas pessoas?</label>
            <input
              v-model.number="numeroPessoas"
              type="number"
              min="1"
              class="form-control mb-2"
            />
            <p class="mb-0 text-muted small">
              Valor por pessoa:
              <span class="fw-semibold text-dark">R$ {{ valorPorPessoa }}</span>
            </p>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Forma de pagamento</h5>

            <div class="btn-group w-100 mb-3" role="group">
              <button
                v-for="forma in formasPagamento"
                :key="forma"
                type="button"
                class="btn"
                :class="pagamentoSelecionado === forma ? 'btn-primary' : 'btn-outline-primary'"
                @click="pagamentoSelecionado = forma"
              >
                {{ forma }}
              </button>
            </div>

            <button
              class="btn btn-success w-100"
              :disabled="!pagamentoSelecionado"
              @click="fecharMesa"
            >
              <i class="bi bi-check-circle me-1"></i>Fechar mesa
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
import { usePedidosStore } from '../stores/pedidos'

const route = useRoute()
const router = useRouter()

const mesasStore = useMesasStore()
const pedidosStore = usePedidosStore()

const mesaId = route.params.mesaId
const mesa = computed(() => mesasStore.getMesaById(mesaId))

const itens = computed(() => pedidosStore.itensDaMesa(mesaId))
const total = computed(() => pedidosStore.totalDaMesa(mesaId))

const numeroPessoas = ref(1)
const valorPorPessoa = computed(() =>
  (total.value / (numeroPessoas.value || 1)).toFixed(2)
)

const formasPagamento = ['Dinheiro', 'Cartão', 'Pix']
const pagamentoSelecionado = ref(null)

function fecharMesa() {
  pedidosStore.finalizarFechamento(mesaId)
  router.push('/home')
}
</script>
