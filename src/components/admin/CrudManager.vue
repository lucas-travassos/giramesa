<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ titulo }}</h1>
      <button class="btn btn-primary" :disabled="carregando || !!erro" @click="abrirNovo">
        <i aria-hidden="true" class="bi bi-plus-lg me-1"></i>Novo
      </button>
    </div>

    <div v-if="sucesso" class="alert alert-success alert-dismissible" role="status">
      {{ sucesso }}
      <button
        type="button"
        class="btn-close"
        aria-label="Fechar mensagem"
        @click="sucesso = ''"
      ></button>
    </div>

    <EstadoConteudo :carregando="carregando" :erro="erro" @recarregar="$emit('recarregar')">
      <div class="table-responsive">
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
                  :aria-label="`Editar ${item.nome ?? item.numero ?? item.id}`"
                  title="Editar"
                  @click="abrirEdicao(item)"
                >
                  <i aria-hidden="true" class="bi bi-pencil"></i>
                </button>
                <button
                  v-if="!inativo(item)"
                  class="btn btn-sm btn-outline-danger"
                  :title="rotuloRemover"
                  :aria-label="`${rotuloRemover} ${item.nome ?? item.numero ?? item.id}`"
                  @click="pedirRemocao(item)"
                >
                  <i aria-hidden="true" class="bi" :class="iconeRemover"></i>
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
    </EstadoConteudo>

    <DialogoModal
      v-if="modalAberto"
      :titulo="`${editando ? 'Editar' : 'Novo'} — ${titulo}`"
      :ocupado="salvando"
      @fechar="fecharModal"
    >
      <form novalidate :aria-busy="salvando" @submit.prevent="salvar">
        <div class="modal-body">
          <fieldset :disabled="salvando">
            <slot name="form" :item="formData" :editando="editando"></slot>
          </fieldset>
          <p
            v-if="tentouSalvar && Object.keys(errosForm).length"
            class="text-danger small"
            role="alert"
          >
            Confira os campos destacados antes de salvar.
          </p>
          <div v-if="erroApi" class="alert alert-danger mt-3 mb-0" role="alert">{{ erroApi }}</div>
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
            <span
              v-if="salvando"
              class="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            ></span>
            {{ salvando ? 'Salvando…' : 'Salvar' }}
          </button>
        </div>
      </form>
    </DialogoModal>
    <DialogoModal
      v-if="itemParaRemover"
      :titulo="rotuloRemover + ' registro'"
      :ocupado="removendo"
      @fechar="itemParaRemover = null"
    >
      <div class="modal-body">
        <p class="mb-0">{{ textoConfirmacao(itemParaRemover) }}</p>
        <div v-if="erroRemocao" class="alert alert-danger mt-3 mb-0" role="alert">
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
          {{ removendo ? 'Aguarde…' : rotuloRemover }}
        </button>
      </div>
    </DialogoModal>
  </div>
</template>

<script setup>
import { ref, provide, nextTick, onBeforeUnmount } from 'vue'
import EstadoConteudo from '../EstadoConteudo.vue'
import DialogoModal from '../DialogoModal.vue'
import { mensagemErro } from '../../utils/erro'

const props = defineProps({
  titulo: { type: String, required: true },
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  novoItem: { type: Function, required: true },
  carregando: { type: Boolean, default: false },
  erro: { type: String, default: '' },
  validar: { type: Function, default: () => ({}) },
  inativo: { type: Function, default: () => false },
  // funcoes assincronas: se a API recusar, o modal continua aberto com a mensagem
  aoSalvar: { type: Function, required: true },
  aoRemover: { type: Function, required: true },
  rotuloRemover: { type: String, default: 'Remover' },
  iconeRemover: { type: String, default: 'bi-trash' },
  mensagemRemovido: { type: String, default: 'Registro removido com sucesso.' },
  textoConfirmacao: {
    type: Function,
    default: (item) => `Remover "${item.nome ?? item.id}"?`,
  },
})

defineEmits(['recarregar'])

const modalAberto = ref(false)
const editando = ref(false)
const formData = ref({})
const errosForm = ref({})
const tentouSalvar = ref(false)
const erroApi = ref('')
const salvando = ref(false)

const itemParaRemover = ref(null)
const erroRemocao = ref('')
const removendo = ref(false)

const sucesso = ref('')
let timer = null
onBeforeUnmount(() => clearTimeout(timer))
function validarCampo(nome) {
  const mensagem = props.validar(formData.value, editando.value)[nome]
  if (mensagem) errosForm.value[nome] = mensagem
  else delete errosForm.value[nome]
}
provide('formularioCadastro', { erros: errosForm, validarCampo })

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
  errosForm.value = {}
  tentouSalvar.value = false
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
  if (salvando.value) return
  tentouSalvar.value = true
  errosForm.value = props.validar(formData.value, editando.value)
  if (Object.keys(errosForm.value).length) {
    await nextTick()
    document.querySelector('[role="dialog"] [aria-invalid="true"]')?.focus()
    return
  }

  salvando.value = true
  erroApi.value = ''
  try {
    await props.aoSalvar({ ...formData.value })
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
    await props.aoRemover(itemParaRemover.value.id)
    itemParaRemover.value = null
    avisarSucesso(props.mensagemRemovido)
  } catch (e) {
    erroRemocao.value = mensagemErro(e, 'Não foi possível concluir a operação.')
  } finally {
    removendo.value = false
  }
}
</script>
