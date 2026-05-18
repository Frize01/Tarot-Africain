<script setup lang="ts">
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer footer-center bg-base-200 p-6 text-base-content">
    <nav class="grid grid-flow-col gap-4">
      <!-- <RouterLink to="/" class="link link-hover">Accueil</RouterLink> -->
      <!-- <RouterLink to="/rules" class="link link-hover">Information</RouterLink> -->
      <!-- <RouterLink to="/contact" class="link link-hover" aria-disabled="true">Contact</RouterLink> -->
      <span class="link link-hover" aria-disabled="true">Accueil</span>
      <span class="link link-hover" aria-disabled="true">Information</span>
      <span class="link link-hover" aria-disabled="true">Contact</span>
    </nav>

    <aside class="opacity-70">
      <p>© {{ year }} Tom</p>
    </aside>
  </footer>
</template>
