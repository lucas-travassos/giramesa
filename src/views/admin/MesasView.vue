<template>
  <CrudManager
    titulo="Cadastro de Mesas"
    :items="mesasStore.mesas"
    :columns="columns"
    :novo-item="novoItem"
    :label-item="(item) => `Mesa ${item.numero}`"
    @salvar="mesasStore.adicionarOuEditar"
    @remover="mesasStore.remover"
  >
    <template #form="{ item }">
      <div class="mb-2">
        <label class="form-label small">Número da mesa</label>
        <input v-model.number="item.numero" type="number" min="1" class="form-control" />
      </div>
    </template>
  </CrudManager>
</template>

<script setup>
import { useMesasStore } from '../../stores/mesas'
import CrudManager from '../../components/admin/CrudManager.vue'

const mesasStore = useMesasStore()

const columns = [
  { key: 'numero', label: 'Número' },
  { key: 'status', label: 'Status' },
  { key: 'consumo', label: 'Consumo', format: (v) => `R$ ${v.toFixed(2)}` },
]

function novoItem() {
  return { numero: '' }
}
</script>
