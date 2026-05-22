<script setup lang="ts">
defineProps<{
  value: number | string | null
  imageFace: string
  imageBack?: string
  shown?: boolean
  borderColor?: string | null
}>()
</script>

<template>
  <div class="indicator-start hover-3d group">
    <!-- ajouter :class="{ 'border': borderColor? borderColor : 'border-white/20' }"
     si besoin gérer border color
    -->
    <span

      v-if="shown"
      class="indicator-item badge badge-neutral font-bold shadow-lg border-white/20 z-10 mr-2">
      {{ value===null ? '*' : value }}
    </span>

    <figure class="card-figure relative shadow-xl transition-transform duration-300 group-hover:shadow-2xl">
      <!-- et ajouter ca :style="borderColor ? `border: 4px solid ${borderColor}` : 'border: 4px solid rgba(255,255,255,0.1)'" -->
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
  width: clamp(70px, 15vw, 110px);
  margin: 0;
}

.hover-3d {
  perspective: 1000px;
}
</style>
