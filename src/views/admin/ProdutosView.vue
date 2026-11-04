<template>
  <CrudManager
    titulo="Cadastro de Produtos"
    :items="produtosStore.produtos"
    :columns="columns"
    :carregando="produtosStore.carregando"
    :erro="produtosStore.erro || categoriasStore.erro"
    :novo-item="novoItem"
    :validar="validar"
    :inativo="(p) => p.status === 'inativo'"
    :ao-salvar="produtosStore.salvar"
    :ao-remover="produtosStore.inativar"
    rotulo-remover="Inativar"
    icone-remover="bi-slash-circle"
    mensagem-removido="Produto inativado com sucesso."
    :texto-confirmacao="textoConfirmacao"
    @recarregar="carregarTudo"
  >
    <template #form="{ item, editando }">
      <CampoFormulario
        v-model="item.nome"
        nome="nome"
        rotulo="Nome"
        maxlength="100"
        :disabled="editando && item.temHistorico"
      />
      <CampoFormulario
        v-model="item.categoriaId"
        nome="categoriaId"
        rotulo="Categoria"
        tipo="select"
        :disabled="editando && item.temHistorico"
        :ajuda="
          editando && item.temHistorico
            ? 'Produto já vendido: nome e categoria preservados. Para trocá-los, inative e cadastre outro produto.'
            : ''
        "
      >
        <option value="" disabled>Selecione uma categoria</option>
        <option v-for="cat in categoriasStore.categorias" :key="cat.id" :value="cat.id">
          {{ cat.nome }}
        </option>
      </CampoFormulario>
      <CampoFormulario
        v-model="item.descricao"
        nome="descricao"
        rotulo="Descrição (opcional)"
        tipo="textarea"
        rows="2"
        maxlength="65535"
      />
      <CampoFormulario
        v-model="item.preco"
        nome="preco"
        rotulo="Preço (R$)"
        tipo="number"
        inputmode="decimal"
        min="0.01"
        max="999999.99"
        step="0.01"
      />
      <CampoFormulario
        v-if="editando"
        v-model="item.status"
        nome="status"
        rotulo="Situação"
        tipo="select"
      >
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </CampoFormulario>
    </template>
  </CrudManager>
</template>

<script setup>
import { onMounted } from 'vue'
import CampoFormulario from '../../components/admin/CampoFormulario.vue'
import { erroTexto, erroInteiro, erroDinheiro, somenteErros } from '../../utils/validacao'
import { useProdutosStore } from '../../stores/produtos'
import { useCategoriasStore } from '../../stores/categorias'
import CrudManager from '../../components/admin/CrudManager.vue'

const produtosStore = useProdutosStore()
const categoriasStore = useCategoriasStore()

const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'preco', label: 'Preço', format: (v) => `R$ ${v.toFixed(2)}` },
  {
    key: 'status',
    label: 'Status',
    format: (v) => (v === 'ativo' ? 'Ativo' : 'Inativo'),
    badge: (v) => (v === 'ativo' ? 'bg-success' : 'bg-secondary'),
  },
]

function novoItem() {
  return {
    nome: '',
    categoriaId: categoriasStore.categorias[0]?.id ?? '',
    descricao: '',
    preco: '',
    status: 'ativo',
  }
}

function validar(p) {
  return somenteErros({
    nome: erroTexto(p.nome, 100),
    categoriaId: erroInteiro(p.categoriaId)
      ? 'Selecione uma categoria. Se necessário, cadastre-a primeiro.'
      : '',
    preco: erroDinheiro(p.preco),
    descricao: (p.descricao?.length ?? 0) > 65535 ? 'Use até 65535 caracteres.' : '',
  })
}

function textoConfirmacao(p) {
  return `Inativar "${p.nome}"? Ele deixa de aparecer no pedido, mas o histórico de vendas é mantido.`
}

function carregarTudo() {
  produtosStore.carregar()
  categoriasStore.carregar()
}

onMounted(carregarTudo)
</script>
