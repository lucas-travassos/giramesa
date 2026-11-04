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
      <CampoFormulario
        v-model="item.nome"
        nome="nome"
        rotulo="Nome"
        maxlength="100"
        autocomplete="name"
      />
      <CampoFormulario
        v-model="item.email"
        nome="email"
        rotulo="E-mail"
        tipo="email"
        maxlength="150"
        autocomplete="email"
      />
      <CampoFormulario
        v-model="item.senha"
        nome="senha"
        :rotulo="editando ? 'Nova senha (opcional)' : 'Senha'"
        tipo="password"
        autocomplete="new-password"
        :ajuda="
          editando
            ? 'Deixe em branco para manter a senha atual.'
            : 'Mínimo de 6 caracteres; até 72 bytes.'
        "
      />
      <CampoFormulario
        v-model="item.nivel_acesso"
        nome="nivel_acesso"
        rotulo="Perfil"
        tipo="select"
      >
        <option v-for="(rotulo, valor) in PERFIS" :key="valor" :value="valor">{{ rotulo }}</option>
      </CampoFormulario>
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
import { erroTexto, erroEmail, erroSenha, somenteErros } from '../../utils/validacao'
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
  return somenteErros({
    nome: erroTexto(u.nome, 100),
    email: erroEmail(u.email),
    senha: erroSenha(u.senha, editando),
  })
}

function textoConfirmacao(u) {
  return `Inativar o usuário "${u.nome}"? Ele deixa de acessar o sistema, mas o histórico de pedidos é mantido.`
}

onMounted(usuariosStore.carregar)
</script>
