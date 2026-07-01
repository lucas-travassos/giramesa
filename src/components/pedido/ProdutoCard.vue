<template>
  <div
    class="card produto-card shadow-sm h-100"
    role="button"
    @click="$emit('adicionar', produto)"
  >
    <div class="card-body d-flex justify-content-between align-items-center">
      <div>
        <p class="mb-0 fw-semibold">{{ produto.nome }}</p>
        <small class="text-muted">R$ {{ produto.preco.toFixed(2) }}</small>
      </div>
      <i class="bi bi-plus-circle-fill text-primary fs-4"></i>
    </div>
  </div>
</template>

<script setup>
defineProps({
  produto: { type: Object, required: true },
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
