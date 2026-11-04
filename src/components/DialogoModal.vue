<template>
  <Teleport to="body">
    <div
      ref="dialogo"
      class="modal d-block gm-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="tituloId"
      tabindex="-1"
      @keydown="teclado"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 :id="tituloId" class="modal-title h5">{{ titulo }}</h2>
            <button
              type="button"
              class="btn-close"
              aria-label="Fechar janela"
              :disabled="ocupado"
              @click="$emit('fechar')"
            ></button>
          </div>
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, useId } from 'vue'
const props = defineProps({ titulo: { type: String, required: true }, ocupado: Boolean })
const emit = defineEmits(['fechar'])
const dialogo = ref(null)
const tituloId = useId()
let anterior, overflow, appInerte
const focaveis = () =>
  [
    ...dialogo.value.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ),
  ].filter((el) => el.getClientRects().length)
onMounted(async () => {
  anterior = document.activeElement
  overflow = document.body.style.overflow
  appInerte = document.querySelector('#app')?.inert
  if (document.querySelector('#app')) document.querySelector('#app').inert = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  const campo = dialogo.value.querySelector(
    'input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
  )
  ;(campo ?? focaveis().find((el) => el.textContent.trim() === 'Cancelar') ?? dialogo.value).focus()
})
onBeforeUnmount(() => {
  document.body.style.overflow = overflow
  if (document.querySelector('#app')) document.querySelector('#app').inert = appInerte
  if (anterior?.isConnected) anterior.focus()
})
function teclado(evento) {
  if (evento.key === 'Escape') {
    evento.preventDefault()
    if (!props.ocupado) emit('fechar')
  }
  if (evento.key !== 'Tab') return
  const elementos = focaveis()
  const primeiro = elementos[0],
    ultimo = elementos.at(-1)
  if (!primeiro) {
    evento.preventDefault()
    dialogo.value.focus()
    return
  }
  if (
    evento.shiftKey &&
    (document.activeElement === primeiro || document.activeElement === dialogo.value)
  ) {
    evento.preventDefault()
    ultimo.focus()
  } else if (
    !evento.shiftKey &&
    (document.activeElement === ultimo || !elementos.includes(document.activeElement))
  ) {
    evento.preventDefault()
    primeiro.focus()
  }
}
</script>
