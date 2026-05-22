<script setup lang="ts">
import VButton from '@/components/VButton.vue';

import { useBreakpoint } from '@/composables/useBreakpoint'
import { useOrientation } from '@/composables/useOrientation'

const { isLandscape } = useOrientation()
const { isSmallScreen, isDesktop, isMobile } = useBreakpoint()

defineProps<{
  cardsCount: number
  forbiddenValue: number
}>()

const emit = defineEmits<{
  (e: 'announce', count: number): void
}>()
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 p-4"
  :class="{ 'items-start pt-20': isLandscape }">

    <div class="rotate-responsive-card w-full max-w-md rounded-2xl bg-black/90 shadow-2xl flex flex-col">

      <div class="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 class="font-luckiest text-white text-lg tracking-widest uppercase mx-auto text-center">
          Combien de plis ?
        </h3>
      </div>

      <div class="p-6 flex flex-row gap-6 justify-center items-center h-full">

        <div class="flex flex-wrap gap-2 justify-center">
          <VButton class="whitespace-nowrap !py-1 !px-4 !text-[10px] uppercase tracking-wider bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-400 transition-all !h-9"
            v-for="score in (cardsCount + 1)"
            :key="score - 1"
            :disabled="(score - 1) === forbiddenValue"
            @click="emit('announce', score - 1)"
                      >
            {{ score - 1 }}
          </VButton>

        </div>

        <p v-if="forbiddenValue >= 0" class="text-xs text-red-400 font-medium italic text-center max-w-[180px]">
          La valeur <span class="underline font-bold">{{ forbiddenValue }}</span> vous est interdite.
        </p>
      </div>

    </div>
  </div>
</template>

