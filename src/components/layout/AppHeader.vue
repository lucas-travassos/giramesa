<template>
  <nav class="navbar navbar-expand-lg navbar-dark gm-navbar px-3">
    <router-link to="/home" class="navbar-brand mb-0 h1">
      <i aria-hidden="true" class="bi bi-cup-hot-fill me-2"></i>GiraMesa
    </router-link>

    <button
      class="navbar-toggler"
      aria-label="Abrir ou recolher menu"
      aria-controls="menu-principal"
      :aria-expanded="menuAberto"
      type="button"
      @click="menuAberto = !menuAberto"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div id="menu-principal" class="collapse navbar-collapse" :class="{ show: menuAberto }">
      <ul class="navbar-nav me-auto">
        <li v-for="item in menu" :key="item.path" class="nav-item">
          <router-link class="nav-link" :to="item.path">{{ item.meta.menu }}</router-link>
        </li>
      </ul>

      <div class="d-flex flex-wrap gap-2 align-items-center text-white">
        <span class="me-3 small">
          {{ authStore.usuarioLogado?.nome }}
          <span class="badge bg-primary ms-1">{{ authStore.perfil }}</span>
        </span>
        <button class="btn btn-outline-light btn-sm" @click="handleLogout">
          <i aria-hidden="true" class="bi bi-box-arrow-right me-1"></i>Sair
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const menuAberto = ref(false)
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    menuAberto.value = false
  },
)

// Menu gerado das rotas: so aparece o que o perfil logado pode acessar
const menu = computed(() =>
  router
    .getRoutes()
    .filter((r) => r.meta.menu && r.meta.perfis.includes(authStore.perfil))
    .sort((a, b) => a.meta.ordem - b.meta.ordem),
)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.nav-link.router-link-active {
  font-weight: 600;
  color: #fff !important;
}
</style>
