<template>
  <CrudManager
    titulo="Cadastro de Mesas"
    :items="mesasStore.mesas"
    :columns="columns"
    :carregando="mesasStore.carregando"
    :erro="mesasStore.erro"
    :novo-item="novoItem"
    :validar="validar"
    :inativo="(m) => m.status === 'inativa'"
    :ao-salvar="mesasStore.salvar"
    :ao-remover="mesasStore.inativar"
    rotulo-remover="Inativar"
    icone-remover="bi-slash-circle"
    mensagem-removido="Mesa inativada com sucesso."
    :texto-confirmacao="textoConfirmacao"
    @recarregar="mesasStore.carregar"
  >
    <template #form="{ item, editando }">
      <CampoFormulario
        v-model="item.numero"
        nome="numero"
        rotulo="Número da mesa"
        tipo="number"
        inputmode="numeric"
        min="1"
        max="2147483647"
        step="1"
        :disabled="editando && item.temHistorico"
        :ajuda="
          editando && item.temHistorico
            ? 'Mesa com histórico: o número é preservado. Para trocá-lo, inative e cadastre outra mesa.'
            : ''
        "
      />
      <CampoFormulario
        v-if="editando && LIVRES.includes(item.status)"
        v-model="item.status"
        nome="status"
        rotulo="Situação"
        tipo="select"
      >
        <option value="disponivel">Ativa (disponível)</option>
        <option value="inativa">Inativa</option>
      </CampoFormulario>
      <p v-else-if="editando" class="form-text">
        Mesa em atendimento: a situação só muda pelo pedido e checkout.
      </p>
    </template>
  </CrudManager>
</template>

<script setup>
import { onMounted } from 'vue'
import CampoFormulario from '../../components/admin/CampoFormulario.vue'
import { erroInteiro, somenteErros } from '../../utils/validacao'
import { useMesasStore } from '../../stores/mesas'
import { STATUS_MESA } from '../../utils/statusMesa'
import CrudManager from '../../components/admin/CrudManager.vue'

const mesasStore = useMesasStore()

const LIVRES = ['disponivel', 'inativa']

const columns = [
  { key: 'numero', label: 'Número' },
  {
    key: 'status',
    label: 'Status',
    format: (v) => STATUS_MESA[v]?.label ?? v,
    badge: (v) => STATUS_MESA[v]?.badge ?? 'bg-secondary',
  },
  { key: 'consumo', label: 'Consumo', format: (v) => `R$ ${v.toFixed(2)}` },
]

function novoItem() {
  return { numero: '' }
}

function validar(m) {
  return somenteErros({ numero: erroInteiro(m.numero) })
}

function textoConfirmacao(m) {
  return `Inativar a Mesa ${m.numero}? Ela deixa de aparecer no salão, mas o histórico é mantido.`
}

onMounted(mesasStore.carregar)
</script>
