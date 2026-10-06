<template>
  <div class="card mesa-card shadow-sm h-100" :class="visual.borda">
    <div class="card-body text-center">
      <div class="mb-2">
        <i class="bi bi-table fs-2"></i>
      </div>
      <h5 class="card-title mb-1">Mesa {{ mesa.numero }}</h5>
      <span class="badge" :class="visual.badge">{{ visual.label }}</span>
      <p class="mt-2 mb-2 fw-semibold">R$ {{ mesa.consumo.toFixed(2) }}</p>

      <!-- Disponível: clique único abre pedido -->
      <button
        v-if="mesa.status === 'disponivel'"
        class="btn btn-sm btn-outline-success w-100"
        @click="$emit('abrir-pedido', mesa)"
      >
        Abrir mesa
      </button>

      <!-- Ocupada: adicionar pedido; fechar conta só caixa/administrador -->
      <div v-else-if="mesa.status === 'ocupada'" class="d-grid gap-1">
        <button class="btn btn-sm btn-outline-primary" @click="$emit('abrir-pedido', mesa)">
          Adicionar pedido
        </button>
        <button
          v-if="podeFechar"
          class="btn btn-sm btn-outline-warning"
          @click="$emit('fechar-conta', mesa)"
        >
          Fechar conta
        </button>
      </div>

      <!-- Caixa: avisa para aguardar -->
      <button
        v-else
        class="btn btn-sm btn-outline-secondary w-100"
        @click="$emit('aguardar', mesa)"
      >
        Aguardando fechamento
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { STATUS_MESA } from '../../utils/statusMesa'

const props = defineProps({
  mesa: { type: Object, required: true },
})

defineEmits(['abrir-pedido', 'fechar-conta', 'aguardar'])

const authStore = useAuthStore()
const visual = computed(() => STATUS_MESA[props.mesa.status])
const podeFechar = computed(() => ['caixa', 'administrador'].includes(authStore.perfil))
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
