<template>
  <div class="d-flex flex-column min-vh-100">
    <a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <AppHeader />
    <main id="conteudo" tabindex="-1" class="flex-grow-1">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>
