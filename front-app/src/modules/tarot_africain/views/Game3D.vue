<script setup lang="ts">
import { useRouter } from 'vue-router'
import Tarot3DApp from '../3d/Tarot3DApp.vue'

const router = useRouter()
</script>

<template>
  <div class="game3d-wrapper">
    <button class="game3d-back" @click="router.push({ name: 'home' })">
      ← Retour
    </button>
    <Tarot3DApp />
  </div>
</template>

<style scoped>
.game3d-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.game3d-back {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: max(12px, env(safe-area-inset-left));
  z-index: 50;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: rgba(13, 7, 5, 0.6);
  color: #fff;
  font-family: 'Poppins', system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.game3d-back:hover {
  background: rgba(13, 7, 5, 0.85);
}
</style>
