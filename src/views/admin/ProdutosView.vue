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
      <div class="mb-2">
        <label class="form-label small">Nome</label>
        <input
          v-model="item.nome"
          type="text"
          class="form-control"
          :disabled="editando && item.temHistorico"
        />
      </div>
      <div class="mb-2">
        <label class="form-label small">Categoria</label>
        <select
          v-model="item.categoriaId"
          class="form-select"
          :disabled="editando && item.temHistorico"
        >
          <option v-for="cat in categoriasStore.categorias" :key="cat.id" :value="cat.id">
            {{ cat.nome }}
          </option>
        </select>
        <p v-if="editando && item.temHistorico" class="small text-muted mt-1 mb-0">
          Este produto já foi vendido, então nome e categoria não podem ser alterados.
          Para trocá-los, inative-o e cadastre um novo produto.
        </p>
      </div>
      <div class="mb-2">
        <label class="form-label small">Descrição (opcional)</label>
        <textarea v-model="item.descricao" rows="2" class="form-control"></textarea>
      </div>
      <div class="mb-2">
        <label class="form-label small">Preço (R$)</label>
        <input v-model.number="item.preco" type="number" step="0.01" min="0.01" class="form-control" />
      </div>
      <div v-if="editando" class="mb-2">
        <label class="form-label small">Status</label>
        <select v-model="item.status" class="form-select">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
    </template>
  </CrudManager>
</template>

<script setup>
import { onMounted } from 'vue'
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
  const erros = []
  if (!p.nome?.trim()) erros.push('Informe o nome do produto.')
  if (!p.categoriaId) erros.push('Selecione a categoria (cadastre uma em Categorias, se não houver).')
  if (!(Number(p.preco) > 0)) erros.push('O preço deve ser maior que zero.')
  return erros
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
