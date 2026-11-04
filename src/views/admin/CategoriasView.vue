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
      <CampoFormulario
        v-model="item.nome"
        nome="nome"
        rotulo="Nome da categoria"
        maxlength="50"
        :ajuda="
          editando
            ? 'Renomear altera a categoria exibida no histórico. Para outro conceito, crie uma nova categoria.'
            : ''
        "
      />
    </template>
  </CrudManager>
</template>

<script setup>
import { onMounted } from 'vue'
import CampoFormulario from '../../components/admin/CampoFormulario.vue'
import { erroTexto, somenteErros } from '../../utils/validacao'
import { useCategoriasStore } from '../../stores/categorias'
import CrudManager from '../../components/admin/CrudManager.vue'

const categoriasStore = useCategoriasStore()

const columns = [{ key: 'nome', label: 'Nome' }]

function novoItem() {
  return { nome: '' }
}

function validar(c) {
  return somenteErros({ nome: erroTexto(c.nome, 50, 'nome da categoria') })
}

function textoConfirmacao(c) {
  return `Remover a categoria "${c.nome}"? Só é possível se não houver produtos vinculados.`
}

onMounted(categoriasStore.carregar)
</script>
