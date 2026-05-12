<script setup lang="ts">
defineProps<{
  value: number | string
  imageFace: string
  imageBack?: string
  shown?: boolean
}>()
</script>

<template>
  <div class="indicator-start hover-3d group">
    <span
      v-if="shown"
      class="indicator-item badge badge-neutral font-bold shadow-lg border-white/20 z-10 mr-2"
    >
      {{ value }}
    </span>

    <figure class="card-figure relative shadow-xl transition-transform duration-300 group-hover:shadow-2xl">
      <img
        v-if="shown"
        :src="imageFace"
        :alt="String(value)"
        class="w-full h-auto block rounded-lg border border-white/10"
      />

      <img
        v-else-if="imageBack"
        :src="imageBack"
        alt="Card Back"
        class="w-full h-auto block rounded-lg shadow-inner"
      />

      <div v-else class="placeholder bg-neutral text-neutral-content w-32 h-48 flex items-center justify-center rounded-lg">
        Dos
      </div>
    </figure>

    <div v-for="n in 8" :key="n"></div>
  </div>
</template>

<style scoped>
.card-figure {
  width: clamp(80px, 15vw, 110px); /* Légèrement réduit pour l'éventail */
  margin: 0;
}

/* On garde ton setup pour l'effet 3D si tu l'utilises via CSS externe */
.hover-3d {
  perspective: 1000px;
}
</style>
