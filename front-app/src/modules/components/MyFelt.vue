<template>
  <div class="laFELT" :class="{ 'felt-mobile-landscape': isLandscape, 'felt-mobile': isMobile }">
    <div class="felt-inner flex flex-row place-content-between">
      <div class="flex gap-1 max-w-fit opacity-50">
        <span v-for="n in maxLifePoints" :key="'life-' + n">
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            :class="n <= currentLife ? 'text-red-500' : 'text-gray-400 opacity-50'"
            class="fill-current transition-colors duration-300"
          >
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.55284 3.00012C7.93598 3.00012 7.23841 3.06514 6.57209 3.29224C2.55494 4.60387 1.26341 8.894 2.39877 12.43L2.40354 12.4448L2.40877 12.4595C3.03435 14.2174 4.04226 15.8127 5.35336 17.1249L5.36091 17.1324L5.36862 17.1398C7.23782 18.9323 9.27254 20.4953 11.4756 21.8515L11.9934 22.1703L12.5147 21.8573C14.7226 20.5315 16.7964 18.9254 18.6432 17.1474L18.649 17.1419L18.6547 17.1362C19.9771 15.8215 20.9851 14.2144 21.6015 12.4549L21.6066 12.4402L21.6113 12.4253C22.7251 8.89703 21.4401 4.60176 17.4507 3.30948C16.7976 3.09221 16.1236 3.00012 15.4648 3.00012C13.9828 3.00011 12.8858 3.62064 12.0004 4.25309C11.1219 3.62545 10.0176 3.00012 8.55284 3.00012Z"/>
          </svg>
        </span>
      </div>
      <div class="flex gap-2 max-w-fit">
        <span v-if="!isMobile && !isTablet" v-for="n in foldsMade" :key="'fold-made-' + n">
          <CardStack
            :count="4"
            imageBack="/tarot_card/dos.jpg"
            />
        </span>
        <span v-else v-if="foldsMade > 0" class="text-sm font-bold">
          <CardStack
            :count="4"
            imageBack="/tarot_card/dos.jpg"
            :labelOnCard="'x' + foldsMade"
            />
        </span>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrientation } from '@/composables/useOrientation'
import { useBreakpoint } from '@/composables/useBreakpoint'
import CardStack from '@/modules/components/CardStack.vue'
import { computed } from 'vue'

const { isLandscape } = useOrientation()
const { isMobile, isTablet } = useBreakpoint()

const props = defineProps<{
  color?: string
  lifePoints?: number
  foldsMade?: number
  foldsAnnounced?: number
}>()

const maxLifePoints = 10
const currentLife = computed(() => Math.min(maxLifePoints, Math.max(0, props.lifePoints ?? 10)))
</script>

<style scoped>
.laFELT {
  --corner-size: 40px;
  --felt-height: 100px;
  --border-thickness: 4px;

  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  height: var(--felt-height);
  background: #4f1111;
  transition: height 0.2s ease;

  --mask:
    radial-gradient(var(--corner-size) at top left,  #0000 98%, #000) 0   0 / 51% 100% no-repeat,
    radial-gradient(var(--corner-size) at top right, #0000 98%, #000) 100% 0 / 51% 100% no-repeat;
  mask: var(--mask);
  -webkit-mask: var(--mask);
}

.laFELT::before {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 var(--border-thickness) 0 #c8a84b,
    inset var(--border-thickness) 0 0 #c8a84b,
    inset calc(-1 * var(--border-thickness)) 0 0 #c8a84b;
  pointer-events: none;
}

.laFELT::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    radial-gradient(
      circle at top left,
      #c8a84b calc(var(--corner-size) - var(--border-thickness)),
      #c8a84b var(--corner-size),
      transparent calc(var(--corner-size) + 4px)
    )
    0 0 / 51% 100% no-repeat,
    radial-gradient(
      circle at top right,
      #c8a84b calc(var(--corner-size) - var(--border-thickness)),
      #c8a84b var(--corner-size),
      transparent calc(var(--corner-size) + 4px)
    )
    100% 0 / 51% 100% no-repeat;

  mask: none;
  -webkit-mask: none;
}

.laFELT.felt-mobile-landscape {
  --felt-height: 140px;
}

.laFELT.felt-mobile {
  --felt-height: 100px;
  --corner-size: 30px;
  --border-thickness: 3px;
}

.felt-inner {
  position: absolute;
  inset: 8px 60px 0;
}
</style>
