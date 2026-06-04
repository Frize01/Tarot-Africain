<script setup lang="ts">
import { ref } from 'vue'
import VButton from '@/components/VButton.vue'
import VInput from '@/components/VInput.vue'

interface Room {
  id: string;
  name: string;
  players: number;
  max: number;
  open: boolean;
  private: boolean
}

defineProps<{
  rooms: Room[] | null
  gameId: string
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'joinCode', code: string): void
  (e: 'joinRoom', id: string): void
}>()

const roomCode = ref('')

const handleJoinByCode = () => {
  if (roomCode.value.trim()) {
    emit('joinCode', roomCode.value)
    roomCode.value = ''
  }
}
</script>

<template>
  <div class="rounded-xl overflow-hidden bg-black/90 border border-orange-700/12 backdrop-blur-md">
    <div class="px-5 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
      <h3 class="font-luckiest text-orange-700/60 text-[16px] tracking-[0.3em] uppercase">Salons</h3>

      <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <VInput
            v-model="roomCode"
            placeholder="Code privé..."
            class="grow border border-white/20 bg-white/[0.03] focus-within:border-orange-500/40 transition-colors !h-9"
          />

          <VButton
            @click="handleJoinByCode"
            class="whitespace-nowrap !py-1 !px-4 !text-[10px] uppercase tracking-wider bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-400 transition-all !h-9"
          >
            Rejoindre
          </VButton>
        </div>

        <VButton
          @click="emit('create')"
          class="w-full sm:w-auto !py-1 !px-6 !text-[10px] uppercase tracking-wider bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-400 transition-all !h-9"
        >
          Créer
        </VButton>
      </div>
    </div>

    <div class="p-4 flex flex-col gap-2">
      <button v-for="room in rooms" :key="room.id"
        :disabled="!room.open"
        @click="emit('joinRoom', room.id)"
        class="relative flex items-center justify-between px-4 py-3 rounded-lg border border-white/5 bg-white/[0.03] transition-all overflow-hidden group"
        :class="room.open ? 'hover:border-orange-500/40' : 'opacity-40 cursor-not-allowed'"
      >
        <div class="relative">
          <p class="text-sm font-bold text-white/90">{{ room.name }}</p>
          <p class="text-[10px] font-mono opacity-40">{{ room.players }}/{{ room.max }} Joueurs</p>
        </div>
        <span class="relative text-[9px] font-black px-2 py-0.5 rounded border"
              :class="room.open ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'">
          {{ room.open ? 'OPEN' : 'FULL' }}
        </span>
      </button>

      <div v-if="rooms.length === 0" class="py-8 text-center text-white/20 text-xs italic">
        Aucun salon disponible...
      </div>
    </div>
  </div>
</template>
