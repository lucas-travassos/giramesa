<template>
  <CrudManager
    titulo="Cadastro de Produtos"
    :items="produtosStore.produtos"
    :columns="columns"
    :novo-item="novoItem"
    :label-item="(item) => item.nome"
    @salvar="produtosStore.adicionarOuEditar"
    @remover="produtosStore.remover"
  >
    <template #form="{ item }">
      <div class="mb-2">
        <label class="form-label small">Nome</label>
        <input v-model="item.nome" type="text" class="form-control" />
      </div>
      <div class="mb-2">
        <label class="form-label small">Categoria</label>
        <select v-model="item.categoria" class="form-select">
          <option v-for="cat in produtosStore.categorias" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
      <div class="mb-2">
        <label class="form-label small">Preço (R$)</label>
        <input v-model.number="item.preco" type="number" step="0.01" min="0" class="form-control" />
      </div>
    </template>
  </CrudManager>
</template>

<script setup>
import { useProdutosStore } from '../../stores/produtos'
import CrudManager from '../../components/admin/CrudManager.vue'

const produtosStore = useProdutosStore()

const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'preco', label: 'Preço', format: (v) => `R$ ${v.toFixed(2)}` },
]

function novoItem() {
  return { nome: '', categoria: produtosStore.categorias[0], preco: 0 }
}
</script>
