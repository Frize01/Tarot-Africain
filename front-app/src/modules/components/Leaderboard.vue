<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  data: { rank: number; name: string; games: number; winRate: string }[]
}>()

const isOpen = ref(true)

</script>

<template>
  <div class="rounded-xl overflow-hidden bg-black/90 border border-orange-700/15 backdrop-blur-md">

    <div
      @click="isOpen = !isOpen"
      class="px-5 py-4 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors select-none"
    >
      <h3 class="font-luckiest text-orange-700/60 text-[16px] tracking-[0.3em] uppercase">Classement</h3>

      <div
        class="text-orange-500/40 transition-transform duration-300"
        :class="{ 'rotate-180': !isOpen }"
      >
        <span class="block transform scale-150 text-[10px]">▼</span>
      </div>
    </div>

    <div
      class="transition-all duration-300 ease-in-out overflow-hidden "
      :class="isOpen ? 'm-4 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <table class="w-full text-left">
        <thead>
          <tr class="text-[9px] tracking-widest text-white/20 uppercase border-b border-white/5">
            <th class="py-3 font-normal">Joueur</th>
            <th class="px-5 py-3 text-right font-normal">Parties Jouées</th>
            <th class="px-5 py-3 text-right font-normal">Winrate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.rank"
              class="hover:bg-orange-900/10 transition-colors group">
            <td class="text-sm text-white/70">{{ row.name }}</td>
            <td class="px-5 py-3 text-right font-mono text-xs text-orange-400/80">{{ row.games }}</td>
            <td class="px-5 py-3 text-right font-mono text-xs text-orange-400/80">{{ row.winRate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
