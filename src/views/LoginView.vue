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
          <label class="form-label">E-mail</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="Digite seu e-mail"
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

        <button type="submit" class="btn btn-primary w-100" :disabled="carregando">
          <span v-if="carregando" class="spinner-border spinner-border-sm me-2"></span>
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
  erro.value = ''
  carregando.value = true
  try {
    await authStore.login(email.value, senha.value)
    router.push('/home')
  } catch (e) {
    erro.value = e.response?.data?.erro ?? 'Não foi possível conectar ao servidor.'
  } finally {
    carregando.value = false
  }
}
</script>
