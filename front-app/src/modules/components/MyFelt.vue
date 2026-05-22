<template>
  <div class="table-felt" :class="{ 'felt-mobile-landscape': isLandscape }">
    <div class="felt-inner" />
  </div>

</template>

<script setup lang="ts">
import { useOrientation } from '@/composables/useOrientation'
import { useSeatLayout } from '@/composables/useSeatLayout'
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isLandscape } = useOrientation()
const { isSmallScreen, isDesktop, isMobile } = useBreakpoint()
</script>

<style scoped>
.table-felt {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110px;
  background: #4f1111;
  border-top: 4px solid #c8a84b;
  /* clip-path: ellipse(60% 100% at 50% 100%); */
  z-index: 5;
}

.table-felt.felt-mobile-landscape {
  height: 90px;
}

.felt-inner {
  position: absolute;
  inset: 8px 60px 0;
  /* border-top: 2px solid #c8a84b; */
  /* clip-path: ellipse(60% 100% at 50% 100%); */
  opacity: 0.4;
}

</style>
