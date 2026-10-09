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
      <div class="mb-2">
        <label class="form-label small">Número da mesa</label>
        <input
          v-model.number="item.numero"
          type="number"
          min="1"
          class="form-control"
          :disabled="editando && item.temHistorico"
        />
        <p v-if="editando && item.temHistorico" class="small text-muted mt-1 mb-0">
          Esta mesa já tem histórico de pedidos, então o número não pode ser alterado.
          Para trocá-lo, inative a mesa e cadastre uma nova.
        </p>
      </div>

      <div v-if="editando" class="mb-2">
        <template v-if="LIVRES.includes(item.status)">
          <label class="form-label small">Situação</label>
          <select v-model="item.status" class="form-select">
            <option value="disponivel">Ativa (disponível)</option>
            <option value="inativa">Inativa</option>
          </select>
        </template>
        <p v-else class="small text-muted mb-0">
          Mesa em atendimento: a situação só muda pelo atendimento (pedido e checkout).
        </p>
      </div>
    </template>
  </CrudManager>
</template>

<script setup>
import { onMounted } from 'vue'
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
  const n = Number(m.numero)
  return Number.isInteger(n) && n >= 1 ? [] : ['Informe um número de mesa inteiro, maior que zero.']
}

function textoConfirmacao(m) {
  return `Inativar a Mesa ${m.numero}? Ela deixa de aparecer no salão, mas o histórico é mantido.`
}

onMounted(mesasStore.carregar)
</script>
