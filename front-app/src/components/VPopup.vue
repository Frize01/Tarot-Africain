<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300"
    @click.self="close"
  >
    <div
      class="relative w-full max-w-md mx-4 rounded-xl overflow-hidden bg-zinc-950 border border-orange-700/30 shadow-[0_0_50px_rgba(234,88,12,0.15)] p-6 text-white animate-in fade-in zoom-in-95 duration-200"
    >

      <div class="flex justify-between items-center mb-6">
        <v-button
          aria-label="Fermer le popup"
          size="btn-sm"
          class="!p-1 w-16 rounded-full text-white/40 hover:text-white transition-colors absolute top-4 right-4"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round " stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </v-button>


      </div>

      <slot/>

    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import VButton from '@/components/VButton.vue'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>
