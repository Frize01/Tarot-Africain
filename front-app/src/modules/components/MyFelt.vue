<template>
  <div class="laFELT">
    <div class="table-felt-border" :class="{ 'felt-mobile-landscape': isLandscape }">
      <div class="table-felt-bg">
        <div class="felt-inner" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrientation } from '@/composables/useOrientation'

const { isLandscape } = useOrientation()

defineProps<{
  color?: string
  lifePoints?: number
  foldsMade?: number
  foldsAnnounced?: number
}>()

</script>

<style scoped>

.laFELT {
  --corner-size: 40px;
  --border-thickness: 4px;
  --felt-height: 100px;
}

.table-felt-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--felt-height);
  background: #c8a84b;
  padding-top: var(--border-thickness);
  padding-left: var(--border-thickness);
  padding-right: var(--border-thickness);
  z-index: 5;
  transition: height 0.2s ease;

  /* coupe coin haut et coin bas */
  --mask:
    radial-gradient(var(--corner-size) at top left, #0000 98%, #000) 0 0 / 51% 100% no-repeat,
    radial-gradient(var(--corner-size) at top right, #0000 98%, #000) 100% 0 / 51% 100% no-repeat;

  mask: var(--mask);
  -webkit-mask: var(--mask);
}

.table-felt-border.felt-mobile-landscape {
  height: 70px;
}

.table-felt-bg {
  width: 100%;
  height: 100%;
  background: #4f1111;
  position: relative;

  mask: var(--mask);
  -webkit-mask: var(--mask);
}

.felt-inner {
  position: absolute;
  inset: 8px 60px 0;
  opacity: 0.4;
}
</style>
