<template>
  <nav class="navbar navbar-dark bg-dark px-3">
    <span class="navbar-brand mb-0 h1">
      <i class="bi bi-cup-hot-fill me-2"></i>GiraMesa
    </span>

    <div class="d-flex align-items-center text-white">
      <span class="me-3 small">
        {{ authStore.usuarioLogado?.nome }}
        <span class="badge bg-primary ms-1">{{ authStore.perfil }}</span>
      </span>
      <button class="btn btn-outline-light btn-sm" @click="handleLogout">
        <i class="bi bi-box-arrow-right me-1"></i>Sair
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>
