<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />
    <main class="flex-grow-1 bg-body-tertiary">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>
