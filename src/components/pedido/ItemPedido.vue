<template>
  <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
    <div>
      <p class="mb-0 small fw-semibold">{{ item.nome }}</p>
      <small class="text-muted">R$ {{ item.preco.toFixed(2) }} un.</small>
    </div>

    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary" @click="$emit('remover-unidade')">
        <i class="bi bi-dash"></i>
      </button>
      <span class="fw-semibold">{{ item.quantidade }}</span>
      <button class="btn btn-sm btn-outline-secondary" @click="$emit('adicionar-unidade')">
        <i class="bi bi-plus"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger" @click="$emit('remover-produto')">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
})
defineEmits(['adicionar-unidade', 'remover-unidade', 'remover-produto'])
</script>
