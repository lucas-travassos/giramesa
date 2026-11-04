<template>
  <div
    class="item-pedido d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 border-bottom"
  >
    <div class="item-pedido-nome min-w-0">
      <p class="mb-0 small fw-semibold">{{ item.nome }}</p>
      <small class="text-muted">R$ {{ item.preco.toFixed(2) }} un.</small>
    </div>

    <div class="d-flex align-items-center gap-2">
      <button
        :disabled="ocupado"
        class="btn btn-sm btn-outline-secondary"
        :aria-label="`Diminuir quantidade de ${item.nome}`"
        @click="$emit('remover-unidade')"
      >
        <i aria-hidden="true" class="bi bi-dash"></i>
      </button>
      <span class="fw-semibold">{{ item.quantidade }}</span>
      <button
        :disabled="ocupado"
        class="btn btn-sm btn-outline-secondary"
        :aria-label="`Aumentar quantidade de ${item.nome}`"
        @click="$emit('adicionar-unidade')"
      >
        <i aria-hidden="true" class="bi bi-plus"></i>
      </button>
      <button
        :disabled="ocupado"
        class="btn btn-sm btn-outline-danger"
        :aria-label="`Remover ${item.nome} do carrinho`"
        @click="$emit('remover-produto')"
      >
        <i aria-hidden="true" class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
  ocupado: Boolean,
})
defineEmits(['adicionar-unidade', 'remover-unidade', 'remover-produto'])
</script>
