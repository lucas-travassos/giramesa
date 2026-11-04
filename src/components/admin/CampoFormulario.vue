<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ rotulo }}</label>
    <component
      :is="tipo === 'select' ? 'select' : tipo === 'textarea' ? 'textarea' : 'input'"
      :id="id"
      :name="nome"
      :type="tipo === 'select' || tipo === 'textarea' ? undefined : tipo"
      :value="modelValue ?? ''"
      v-bind="$attrs"
      :class="[tipo === 'select' ? 'form-select' : 'form-control', { 'is-invalid': erro }]"
      :aria-invalid="erro ? 'true' : undefined"
      :aria-describedby="descricao"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="aoSair"
      ><slot></slot
    ></component>
    <div v-if="erro" :id="`${id}-erro`" class="invalid-feedback">{{ erro }}</div>
    <div v-if="ajuda" :id="`${id}-ajuda`" class="form-text">{{ ajuda }}</div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  nome: { type: String, required: true },
  rotulo: { type: String, required: true },
  tipo: { type: String, default: 'text' },
  ajuda: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
const formulario = inject('formularioCadastro', null)
const id = computed(() => `cadastro-${props.nome}`)
const erro = computed(() => formulario?.erros.value[props.nome])
const descricao = computed(
  () =>
    [erro.value && `${id.value}-erro`, props.ajuda && `${id.value}-ajuda`]
      .filter(Boolean)
      .join(' ') || undefined,
)
function aoSair(evento) {
  // O clique em Salvar valida o conjunto sem deslocar o botão durante o clique.
  if (evento.relatedTarget?.closest('button')) return
  formulario?.validarCampo(props.nome)
}
</script>
