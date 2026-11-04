<template>
  <button
    :disabled="ocupado"
    class="card produto-card shadow-sm h-100 w-100 text-start"
    type="button"
    :aria-label="`Adicionar ${produto.nome}, R$ ${produto.preco.toFixed(2)}`"
    @click="$emit('adicionar', produto)"
  >
    <span class="card-body w-100 d-flex justify-content-between align-items-center">
      <span class="min-w-0 me-3">
        <span class="d-block fw-semibold">{{ produto.nome }}</span>
        <small class="text-muted">R$ {{ produto.preco.toFixed(2) }}</small>
      </span>
      <i aria-hidden="true" class="bi bi-plus-circle-fill text-primary fs-4"></i>
    </span>
  </button>
</template>

<script setup>
defineProps({
  produto: { type: Object, required: true },
  ocupado: Boolean,
})
defineEmits(['adicionar'])
</script>

<style scoped>
.produto-card {
  transition: background-color 0.15s ease;
}
.produto-card:hover {
  background-color: var(--bs-light);
}
</style>
