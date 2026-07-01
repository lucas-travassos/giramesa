<template>
  <div class="login-page d-flex align-items-center justify-content-center vh-100">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 380px;">
      <div class="text-center mb-4">
        <i class="bi bi-cup-hot-fill fs-1 text-primary"></i>
        <h1 class="h4 mt-2 mb-0">GiraMesa</h1>
        <small class="text-muted">Gestão de mesas e pedidos</small>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Usuário</label>
          <input
            v-model="usuario"
            type="text"
            class="form-control"
            placeholder="Digite seu usuário"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Senha</label>
          <input
            v-model="senha"
            type="password"
            class="form-control"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div v-if="erro" class="alert alert-danger py-2 small mb-3">
          {{ erro }}
        </div>

        <button type="submit" class="btn btn-primary w-100">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const usuario = ref('')
const senha = ref('')
const erro = ref('')

const router = useRouter()
const authStore = useAuthStore()

function handleLogin() {
  const sucesso = authStore.login(usuario.value, senha.value)

  if (!sucesso) {
    erro.value = 'Usuário ou senha inválidos.'
    return
  }

  erro.value = ''
  router.push('/home')
}
</script>
