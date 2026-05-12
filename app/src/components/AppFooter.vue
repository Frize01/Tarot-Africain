<script setup lang="ts">
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer footer-center bg-base-200 p-6 text-base-content">
    <nav class="grid grid-flow-col gap-4">
      <RouterLink to="/" class="link link-hover">Accueil</RouterLink>
      <RouterLink to="/rules" class="link link-hover">Information</RouterLink>
      <a class="link link-hover" href="#" aria-disabled="true">Contact</a>
    </nav>

    <aside class="opacity-70">
      <p>© {{ year }} Tom</p>
    </aside>
  </footer>
</template>
