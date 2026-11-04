<template>
  <div class="login-page d-flex align-items-center justify-content-center p-3">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 380px">
      <div class="text-center mb-4">
        <i aria-hidden="true" class="bi bi-cup-hot-fill fs-1 text-primary"></i>
        <h1 class="h4 mt-2 mb-0">GiraMesa</h1>
        <small class="text-muted">Gestão de mesas e pedidos</small>
      </div>

      <form novalidate :aria-busy="carregando" @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="login-email" class="form-label">E-mail</label>
          <input
            id="login-email"
            v-model="email"
            autocomplete="username"
            maxlength="150"
            :class="{ 'is-invalid': erros.email }"
            :aria-invalid="erros.email ? 'true' : undefined"
            :aria-describedby="erros.email ? 'login-email-erro' : undefined"
            @blur="validarEmail"
            type="email"
            class="form-control"
            placeholder="Digite seu e-mail"
            required
          />
          <div v-if="erros.email" id="login-email-erro" class="invalid-feedback">
            {{ erros.email }}
          </div>
        </div>

        <div class="mb-3">
          <label for="login-senha" class="form-label">Senha</label>
          <input
            id="login-senha"
            v-model="senha"
            autocomplete="current-password"
            :class="{ 'is-invalid': erros.senha }"
            :aria-invalid="erros.senha ? 'true' : undefined"
            :aria-describedby="erros.senha ? 'login-senha-erro' : undefined"
            type="password"
            class="form-control"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div v-if="erros.senha" id="login-senha-erro" class="text-danger small mb-3">
          {{ erros.senha }}
        </div>
        <div v-if="erro" role="alert" class="alert alert-danger py-2 small mb-3">
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
import { ref, nextTick } from 'vue'
import { erroEmail } from '../utils/validacao'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const senha = ref('')
const erro = ref('')
const erros = ref({})
function validarEmail() {
  erros.value.email = erroEmail(email.value)
}
const carregando = ref(false)

const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
  if (carregando.value) return
  validarEmail()
  erros.value.senha = senha.value ? '' : 'Informe a senha.'
  if (erros.value.email || erros.value.senha) {
    await nextTick()
    document.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
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
