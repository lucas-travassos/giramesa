<template>
  <CrudManager
    titulo="Cadastro de Usuários"
    :items="usuariosStore.usuarios"
    :columns="columns"
    :novo-item="novoItem"
    :label-item="(item) => item.nome"
    @salvar="usuariosStore.adicionarOuEditar"
    @remover="usuariosStore.remover"
  >
    <template #form="{ item }">
      <div class="mb-2">
        <label class="form-label small">Nome</label>
        <input v-model="item.nome" type="text" class="form-control" />
      </div>
      <div class="mb-2">
        <label class="form-label small">Usuário</label>
        <input v-model="item.usuario" type="text" class="form-control" />
      </div>
      <div class="mb-2">
        <label class="form-label small">Perfil</label>
        <select v-model="item.perfil" class="form-select">
          <option value="garcom">Garçom</option>
          <option value="caixa">Caixa</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
    </template>
  </CrudManager>
</template>

<script setup>
import { useUsuariosStore } from '../../stores/usuarios'
import CrudManager from '../../components/admin/CrudManager.vue'

const usuariosStore = useUsuariosStore()

const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'perfil', label: 'Perfil' },
]

function novoItem() {
  return { nome: '', usuario: '', perfil: 'garcom' }
}
</script>
