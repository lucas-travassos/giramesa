<template>
  <footer class="bg-light text-center text-muted py-2 small border-top">
    GiraMesa &copy; {{ ano }} — Projeto acadêmico SENAI
  </footer>
</template>

<script setup>
const ano = new Date().getFullYear()
</script>
