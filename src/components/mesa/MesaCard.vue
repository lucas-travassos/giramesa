<template>
  <div class="card mesa-card shadow-sm h-100" :class="corBorda">
    <div class="card-body text-center">
      <div class="mb-2">
        <i class="bi bi-table fs-2"></i>
      </div>
      <h5 class="card-title mb-1">Mesa {{ mesa.numero }}</h5>
      <span class="badge" :class="corBadge">{{ statusLabel }}</span>
      <p class="mt-2 mb-2 fw-semibold">R$ {{ mesa.consumo.toFixed(2) }}</p>

      <!-- Disponível: clique único abre pedido -->
      <button
        v-if="mesa.status === 'disponivel'"
        class="btn btn-sm btn-outline-success w-100"
        @click="$emit('abrir-pedido', mesa)"
      >
        Abrir mesa
      </button>

      <!-- Ocupada: dois caminhos -->
      <div v-else-if="mesa.status === 'ocupada'" class="d-grid gap-1">
        <button
          class="btn btn-sm btn-outline-primary"
          @click="$emit('abrir-pedido', mesa)"
        >
          Adicionar pedido
        </button>
        <button
          class="btn btn-sm btn-outline-warning"
          @click="$emit('fechar-conta', mesa)"
        >
          Fechar conta
        </button>
      </div>

      <!-- Caixa: bloqueado -->
      <button
        v-else
        class="btn btn-sm btn-outline-secondary w-100"
        disabled
      >
        Aguardando fechamento
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mesa: { type: Object, required: true },
})

defineEmits(['abrir-pedido', 'fechar-conta'])

const STATUS_MAP = {
  disponivel: { label: 'Disponível', badge: 'bg-success', borda: 'border-success' },
  ocupada: { label: 'Ocupada', badge: 'bg-danger', borda: 'border-danger' },
  caixa: { label: 'Em fechamento', badge: 'bg-warning text-dark', borda: 'border-warning' },
}

const statusLabel = computed(() => STATUS_MAP[props.mesa.status].label)
const corBadge = computed(() => STATUS_MAP[props.mesa.status].badge)
const corBorda = computed(() => STATUS_MAP[props.mesa.status].borda)
</script>

<style scoped>
.mesa-card {
  border-width: 2px;
  transition: transform 0.15s ease;
}
.mesa-card:hover {
  transform: translateY(-3px);
}
</style>
