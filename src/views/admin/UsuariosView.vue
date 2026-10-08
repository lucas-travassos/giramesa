<template>
  <CrudManager
    titulo="Cadastro de Usuários"
    :items="usuariosStore.usuarios"
    :columns="columns"
    :carregando="usuariosStore.carregando"
    :erro="usuariosStore.erro"
    :novo-item="novoItem"
    :validar="validar"
    :inativo="(u) => u.status === 'inativo'"
    :ao-salvar="usuariosStore.salvar"
    :ao-remover="usuariosStore.inativar"
    rotulo-remover="Inativar"
    icone-remover="bi-slash-circle"
    mensagem-removido="Usuário inativado com sucesso."
    :texto-confirmacao="textoConfirmacao"
    @recarregar="usuariosStore.carregar"
  >
    <template #form="{ item, editando }">
      <div class="mb-2">
        <label class="form-label small">Nome</label>
        <input v-model="item.nome" type="text" class="form-control" />
      </div>
      <div class="mb-2">
        <label class="form-label small">E-mail</label>
        <input v-model="item.email" type="email" class="form-control" />
      </div>
      <div class="mb-2">
        <label class="form-label small">
          {{ editando ? 'Nova senha (opcional)' : 'Senha' }}
        </label>
        <input
          v-model="item.senha"
          type="password"
          class="form-control"
          autocomplete="new-password"
          :placeholder="editando ? 'Deixe em branco para manter a atual' : 'Mínimo de 6 caracteres'"
        />
      </div>
      <div class="mb-2">
        <label class="form-label small">Perfil</label>
        <select v-model="item.nivel_acesso" class="form-select">
          <option v-for="(rotulo, valor) in PERFIS" :key="valor" :value="valor">
            {{ rotulo }}
          </option>
        </select>
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
import { useUsuariosStore } from '../../stores/usuarios'
import CrudManager from '../../components/admin/CrudManager.vue'

const usuariosStore = useUsuariosStore()

const PERFIS = { garcom: 'Garçom', caixa: 'Caixa', administrador: 'Administrador' }

const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'nivel_acesso', label: 'Perfil', format: (v) => PERFIS[v] ?? v },
  {
    key: 'status',
    label: 'Status',
    format: (v) => (v === 'ativo' ? 'Ativo' : 'Inativo'),
    badge: (v) => (v === 'ativo' ? 'bg-success' : 'bg-secondary'),
  },
]

function novoItem() {
  return { nome: '', email: '', senha: '', nivel_acesso: 'garcom', status: 'ativo' }
}

function validar(u, editando) {
  const erros = []
  if (!u.nome?.trim()) erros.push('Informe o nome.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((u.email ?? '').trim())) erros.push('Informe um e-mail válido.')
  if (!editando && !u.senha) erros.push('Informe a senha.')
  if (u.senha && u.senha.length < 6) erros.push('A senha deve ter no mínimo 6 caracteres.')
  return erros
}

function textoConfirmacao(u) {
  return `Inativar o usuário "${u.nome}"? Ele deixa de acessar o sistema, mas o histórico de pedidos é mantido.`
}

onMounted(usuariosStore.carregar)
</script>
