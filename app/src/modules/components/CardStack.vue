<script setup lang="ts">
defineProps<{
  count: number;
  imageBack: string;
  label?: string;
}>();
</script>

<template>
  <div class="stack-wrapper">
    <div class="cards-container">
      <div
        v-for="n in Math.min(count, 5)"
        :key="n"
        class="stacked-card"
        :style="{
          transform: `translateY(-${n * 2}px) translateX(${n * 1}px)`,
          zIndex: n
        }"
      >
        <img :src="imageBack" alt="Card Back" />
      </div>

      <div v-if="count === 0" class="empty-slot"></div>
    </div>
    <span v-if="label" class="stack-label">{{ label }} ({{ count }})</span>
  </div>
</template>

<style scoped>
.stack-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cards-container {
  position: relative;
  width: 60px;  /* Taille réduite pour les piles secondaires */
  height: 85px;
}

.stacked-card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.2);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
}

.stacked-card img { width: 100%; height: 100%; object-fit: cover; }

.empty-slot {
  width: 100%;
  height: 100%;
  border: 2px dashed #444;
  border-radius: 4px;
}

.stack-label {
  margin-top: 10px;
  font-size: 0.75rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
