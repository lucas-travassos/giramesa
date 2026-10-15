<template>
  <CrudManager
    titulo="Cadastro de Categorias"
    :items="categoriasStore.categorias"
    :columns="columns"
    :carregando="categoriasStore.carregando"
    :erro="categoriasStore.erro"
    :novo-item="novoItem"
    :validar="validar"
    :ao-salvar="categoriasStore.salvar"
    :ao-remover="categoriasStore.remover"
    rotulo-remover="Remover"
    mensagem-removido="Categoria removida com sucesso."
    :texto-confirmacao="textoConfirmacao"
    @recarregar="categoriasStore.carregar"
  >
    <template #form="{ item, editando }">
      <div class="mb-2">
        <label class="form-label small">Nome da categoria</label>
        <input v-model="item.nome" type="text" class="form-control" />
        <p v-if="editando" class="small text-muted mt-1 mb-0">
          Renomear altera o nome em todo o histórico. Para outro conceito, crie uma nova categoria.
        </p>
      </div>
    </template>
  </CrudManager>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCategoriasStore } from '../../stores/categorias'
import CrudManager from '../../components/admin/CrudManager.vue'

const categoriasStore = useCategoriasStore()

const columns = [{ key: 'nome', label: 'Nome' }]

function novoItem() {
  return { nome: '' }
}

function validar(c) {
  return c.nome?.trim() ? [] : ['Informe o nome da categoria.']
}

function textoConfirmacao(c) {
  return `Remover a categoria "${c.nome}"? Só é possível se não houver produtos vinculados.`
}

onMounted(categoriasStore.carregar)
</script>
