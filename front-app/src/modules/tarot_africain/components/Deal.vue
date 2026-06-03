<script setup lang="ts">
import VButton from '@/components/VButton.vue';

import { useBreakpoint } from '@/composables/useBreakpoint'
import { useOrientation } from '@/composables/useOrientation'

const { isLandscape } = useOrientation()
const { isDesktop, isMobile } = useBreakpoint()

defineProps<{
  cardsCount: number
  forbiddenValue: number
  opponents: {
    id: string
    name: string
    color: string
    cardCount: number
    lifePoints?: number
    foldsMade?: number
    foldsAnnounced?: number
    imageUrl?: string
    isAlive?: boolean
  }[]
}>()

const emit = defineEmits<{
  (e: 'announce', count: number): void
}>()
</script>

<template>
  <div class="smart-landscape-wrapper z-50 flex justify-center items-start pt-12 p-4">

    <div class="w-full max-w-md rounded-2xl border-2 border-[#c8a84b] bg-[#4f1111] shadow-2xl flex flex-col">

      <div class="px-5 py-4 border-b border-[#c8a84b]/50 grid grid-cols-3 items-center bg-white/[0.02]">
        <div></div>

        <h3 class="font-luckiest text-white text-lg tracking-widest uppercase text-center whitespace-nowrap">
          Combien de plis ?
        </h3>

        <div class="flex justify-end">
          <div v-if="forbiddenValue >= 0"
              class="btn btn-square btn-sm border border-red-500/30 bg-red-500/10 text-red-400 pointer-events-none relative flex flex-col justify-center items-center font-bold text-sm h-10 w-10 rounded-xl">
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-7 h-[2px] bg-red-500 rotate-45 opacity-80"></div>
            </div>
            <span class="z-10 leading-none">{{ forbiddenValue }}</span>
          </div>
        </div>
      </div>

      <div class="p-6 flex flex-col gap-4 justify-center items-center">
        <div class="flex flex-wrap gap-2 justify-center">
          <VButton class="whitespace-nowrap !py-1 !px-4 !text-[10px] uppercase tracking-wider border border-orange-500/30 text-orange-400 transition-all !h-9"
            v-for="score in (cardsCount + 1)"
            :key="score - 1"
            :disabled="(score - 1) === forbiddenValue"
            :class="(score - 1) === forbiddenValue ? 'cursor-not-allowed opacity-50 bg-gray-800/80' : 'bg-orange-600/20 hover:bg-orange-600/40'"
            @click="emit('announce', score - 1)">
            {{ score - 1 }}
          </VButton>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.smart-landscape-wrapper {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
}

@media (orientation: portrait) {
  .smart-landscape-wrapper {
    width: 100dvh;
    height: 100dvw;

    transform-origin: top left;
    transform: rotate(90deg) translateY(-100%);
  }
}
</style>
