<template>
  <div
    class="card mesa-card shadow-sm h-100"
    :class="corBorda"
    role="button"
    @click="$emit('clicar', mesa)"
  >
    <div class="card-body text-center">
      <div class="mb-2">
        <i class="bi bi-table fs-2"></i>
      </div>
      <h5 class="card-title mb-1">Mesa {{ mesa.numero }}</h5>
      <span class="badge" :class="corBadge">{{ statusLabel }}</span>
      <p class="mt-2 mb-0 fw-semibold">
        R$ {{ mesa.consumo.toFixed(2) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mesa: { type: Object, required: true },
})

defineEmits(['clicar'])

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
