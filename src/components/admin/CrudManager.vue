<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ titulo }}</h1>
      <button class="btn btn-primary btn-sm" @click="abrirNovo">
        <i class="bi bi-plus-lg me-1"></i>Novo
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle bg-white shadow-sm">
        <thead class="table-light">
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td v-for="col in columns" :key="col.key">
              {{ col.format ? col.format(item[col.key]) : item[col.key] }}
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-secondary me-1" @click="abrirEdicao(item)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="confirmarRemocao(item)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="columns.length + 1" class="text-center text-muted py-3">
              Nenhum registro cadastrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modalAberto" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editando ? 'Editar' : 'Novo' }} — {{ titulo }}</h5>
            <button class="btn-close" @click="fecharModal"></button>
          </div>
          <div class="modal-body">
            <slot name="form" :item="formData"></slot>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="fecharModal">Cancelar</button>
            <button class="btn btn-primary" @click="salvar">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  titulo: { type: String, required: true },
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  novoItem: { type: Function, required: true },
  labelItem: { type: Function, default: (item) => item.nome ?? item.id },
})

const emit = defineEmits(['salvar', 'remover'])

const modalAberto = ref(false)
const editando = ref(false)
const formData = ref({})

function abrirNovo() {
  formData.value = props.novoItem()
  editando.value = false
  modalAberto.value = true
}

function abrirEdicao(item) {
  formData.value = { ...item }
  editando.value = true
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
}

function salvar() {
  emit('salvar', { ...formData.value })
  modalAberto.value = false
}

function confirmarRemocao(item) {
  if (confirm(`Remover "${props.labelItem(item)}"?`)) {
    emit('remover', item.id)
  }
}
</script>
