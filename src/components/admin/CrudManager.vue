<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ titulo }}</h1>
      <button class="btn btn-primary btn-sm" @click="abrirNovo">
        <i class="bi bi-plus-lg me-1"></i>Novo
      </button>
    </div>

    <div v-if="sucesso" class="alert alert-success alert-dismissible">
      {{ sucesso }}
      <button type="button" class="btn-close" @click="sucesso = ''"></button>
    </div>

    <div v-if="carregando && !items.length" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else>
      <div
        v-if="erro"
        class="alert alert-danger d-flex justify-content-between align-items-center"
      >
        <span>{{ erro }}</span>
        <button class="btn btn-sm btn-outline-danger" @click="$emit('recarregar')">
          Tentar de novo
        </button>
      </div>

      <div v-if="!erro || items.length" class="table-responsive">
        <table class="table table-hover align-middle bg-white shadow-sm">
          <thead class="table-light">
            <tr>
              <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              :class="{ 'table-secondary text-muted': inativo(item) }"
            >
              <td v-for="col in columns" :key="col.key">
                <span v-if="col.badge" class="badge" :class="col.badge(item[col.key])">
                  {{ formatar(col, item) }}
                </span>
                <template v-else>{{ formatar(col, item) }}</template>
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-secondary me-1"
                  title="Editar"
                  @click="abrirEdicao(item)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  v-if="!inativo(item)"
                  class="btn btn-sm btn-outline-danger"
                  :title="rotuloRemover"
                  @click="pedirRemocao(item)"
                >
                  <i class="bi" :class="iconeRemover"></i>
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
    </template>

    <!-- Modal de cadastro/edicao -->
    <div v-if="modalAberto" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <form class="modal-content" novalidate @submit.prevent="salvar">
          <div class="modal-header">
            <h5 class="modal-title">{{ editando ? 'Editar' : 'Novo' }} — {{ titulo }}</h5>
            <button type="button" class="btn-close" @click="fecharModal"></button>
          </div>
          <div class="modal-body">
            <slot name="form" :item="formData" :editando="editando"></slot>

            <div v-if="errosForm.length" class="alert alert-danger py-2 small mt-3 mb-0">
              <ul class="mb-0 ps-3">
                <li v-for="msg in errosForm" :key="msg">{{ msg }}</li>
              </ul>
            </div>
            <div v-if="erroApi" class="alert alert-danger py-2 small mt-3 mb-0">
              {{ erroApi }}
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="salvando"
              @click="fecharModal"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmacao de remocao/inativacao -->
    <div
      v-if="itemParaRemover"
      class="modal d-block"
      style="background: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body">
            <p class="mb-0">{{ textoConfirmacao(itemParaRemover) }}</p>
            <div v-if="erroRemocao" class="alert alert-danger py-2 small mt-3 mb-0">
              {{ erroRemocao }}
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-outline-secondary"
              :disabled="removendo"
              @click="itemParaRemover = null"
            >
              Cancelar
            </button>
            <button class="btn btn-danger" :disabled="removendo" @click="confirmarRemocao">
              <span v-if="removendo" class="spinner-border spinner-border-sm me-2"></span>
              {{ rotuloRemover }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { mensagemErro } from '../../utils/erro'

const props = defineProps({
  titulo: { type: String, required: true },
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  novoItem: { type: Function, required: true },
  labelItem: { type: Function, default: (item) => item.nome ?? item.id },
  carregando: { type: Boolean, default: false },
  erro: { type: String, default: '' },
  validar: { type: Function, default: () => [] },
  inativo: { type: Function, default: () => false },
  // funcoes assincronas: se a API recusar, o modal continua aberto com a mensagem
  aoSalvar: { type: Function, default: null },
  aoRemover: { type: Function, default: null },
  rotuloRemover: { type: String, default: 'Remover' },
  iconeRemover: { type: String, default: 'bi-trash' },
  mensagemRemovido: { type: String, default: 'Registro removido com sucesso.' },
  textoConfirmacao: {
    type: Function,
    default: (item) => `Remover "${item.nome ?? item.id}"?`,
  },
})

// 'salvar'/'remover' = caminho antigo dos CRUDs ainda mockados (saem no 11.7)
const emit = defineEmits(['salvar', 'remover', 'recarregar'])

const modalAberto = ref(false)
const editando = ref(false)
const formData = ref({})
const errosForm = ref([])
const erroApi = ref('')
const salvando = ref(false)

const itemParaRemover = ref(null)
const erroRemocao = ref('')
const removendo = ref(false)

const sucesso = ref('')
let timer = null

function formatar(col, item) {
  return col.format ? col.format(item[col.key]) : item[col.key]
}

function avisarSucesso(texto) {
  sucesso.value = texto
  clearTimeout(timer)
  timer = setTimeout(() => (sucesso.value = ''), 4000)
}

function abrirModal(dados, emEdicao) {
  formData.value = dados
  editando.value = emEdicao
  errosForm.value = []
  erroApi.value = ''
  modalAberto.value = true
}

function abrirNovo() {
  abrirModal(props.novoItem(), false)
}

function abrirEdicao(item) {
  abrirModal({ ...item }, true)
}

function fecharModal() {
  if (!salvando.value) modalAberto.value = false
}

async function salvar() {
  errosForm.value = props.validar(formData.value, editando.value)
  if (errosForm.value.length) return

  salvando.value = true
  erroApi.value = ''
  try {
    if (props.aoSalvar) await props.aoSalvar({ ...formData.value })
    else emit('salvar', { ...formData.value })
    modalAberto.value = false
    avisarSucesso('Alterações salvas com sucesso.')
  } catch (e) {
    erroApi.value = mensagemErro(e, 'Não foi possível salvar. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

function pedirRemocao(item) {
  erroRemocao.value = ''
  itemParaRemover.value = item
}

async function confirmarRemocao() {
  removendo.value = true
  erroRemocao.value = ''
  try {
    if (props.aoRemover) await props.aoRemover(itemParaRemover.value.id)
    else emit('remover', itemParaRemover.value.id)
    itemParaRemover.value = null
    avisarSucesso(props.mensagemRemovido)
  } catch (e) {
    erroRemocao.value = mensagemErro(e, 'Não foi possível concluir a operação.')
  } finally {
    removendo.value = false
  }
}
</script>
