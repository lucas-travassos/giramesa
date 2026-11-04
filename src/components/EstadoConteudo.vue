<template>
  <div v-if="carregando" class="text-center py-5" role="status" aria-live="polite">
    <span class="spinner-border text-primary" aria-hidden="true"></span>
    <p class="mt-2 mb-0">Carregando…</p>
  </div>
  <div
    v-else-if="erro"
    class="alert alert-danger d-flex flex-wrap gap-3 align-items-center justify-content-between"
    role="alert"
  >
    <span>{{ erro }}</span>
    <button type="button" class="btn btn-outline-danger" @click="$emit('recarregar')">
      Tentar novamente
    </button>
  </div>
  <div v-else-if="vazio" class="text-center text-secondary py-5" role="status">
    {{ mensagemVazio }}
  </div>
  <slot v-else></slot>
</template>

<script setup>
defineProps({
  carregando: Boolean,
  erro: { type: String, default: '' },
  vazio: Boolean,
  mensagemVazio: { type: String, default: 'Nenhum registro cadastrado.' },
})
defineEmits(['recarregar'])
</script>
