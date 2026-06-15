<script setup lang="ts">
import { ref } from 'vue'
import VButton from '@/components/VButton.vue'
import VInput from '@/components/VInput.vue'

interface Player {
  id: number
  firstname: string
  lastname: string
  email: string
  pivot: {
    room_id: string
    user_id: number
    position: number
    is_ready: boolean
    is_host: boolean
  }
}

interface Room {
  id: string
  code: string
  status: string
  game_id: number
  players: Player[]
  is_public: boolean
  game: {
    id: number
    name: string
    slug: string
    min_players: number
    max_players: number
    url: string
    description: string
  }
}

const props = defineProps<{
  rooms: Room[] | null
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'joinCode', code: string): void
  (e: 'joinRoom', id: string): void
  (e: 'refresh'): void
}>()

const roomCode = ref('')
const isRefreshing = ref(false)

// evite le spamclic
const handleRefreshClick = () => {
  if (isRefreshing.value) {
    return
  }
  isRefreshing.value = true
  emit('refresh')

  setTimeout(() => {
    isRefreshing.value = false
  }, 1500)
}

const handleJoinByCode = () => {
  if (roomCode.value.trim()) {
    emit('joinCode', roomCode.value)
    roomCode.value = ''
  }
}

const getHostName = (room: Room) => {
  if (!room.players) return 'Inconnu'
  const hostPlayer = room.players.find(player => player.pivot?.is_host)
  return hostPlayer ? `Room de "${hostPlayer.firstname} ${hostPlayer.lastname}"` : 'Salon Public'
}
</script>

<template>
  <div class="rounded-xl overflow-hidden bg-black/90 border border-orange-700/12 backdrop-blur-md">
    <div class="px-5 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
      <h3 class="font-luckiest text-orange-700/60 text-[16px] tracking-[0.3em] uppercase">Salons</h3>

      <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
        <div class="flex items-center gap-2 w-full sm:w-auto">

          <VButton
            @click="handleRefreshClick"
            class="whitespace-nowrap !py-1 !px-4 !text-[10px] uppercase tracking-wider bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-400 transition-all !h-9"
          >
            <svg width="16px" height="16px" viewBox="-0.45 0 60.369 60.369" xmlns="http://www.w3.org/2000/svg" class="fill-current">
              <g id="Group_63" data-name="Group 63" transform="translate(-446.571 -211.615)">
                <path id="Path_54" data-name="Path 54" d="M504.547,265.443h-9.019a30.964,30.964,0,0,0-29.042-52.733,1.5,1.5,0,1,0,.792,2.894,27.955,27.955,0,0,1,25.512,48.253l0-10.169h-.011a1.493,1.493,0,0,0-2.985,0h0v13.255a1.5,1.5,0,0,0,1.5,1.5h13.256a1.5,1.5,0,1,0,0-3Z" fill="currentColor"/>
                <path id="Path_55" data-name="Path 55" d="M485.389,267.995a27.956,27.956,0,0,1-25.561-48.213l0,10.2h.015a1.491,1.491,0,0,0,2.978,0h.007V216.791a1.484,1.484,0,0,0-1.189-1.532l-.018-.005a1.533,1.533,0,0,0-.223-.022c-.024,0-.046-.007-.07-.007H448.071a1.5,1.5,0,0,0,0,3h8.995a30.963,30.963,0,0,0,29.115,52.664,1.5,1.5,0,0,0-.792-2.894Z" fill="currentColor"/>
              </g>
            </svg>
          </VButton>

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
      <template v-for="room in props.rooms" :key="room.id">
        <button
          v-if="room && room.is_public"
          @click="emit('joinRoom', room.code)"
          class="relative flex items-center justify-between px-4 py-3 rounded-lg border border-white/5 bg-white/[0.03] transition-all overflow-hidden group"
        >
          <div class="relative">
            <p class="text-sm font-bold text-white/90">{{ getHostName(room) }}</p>

            <p class="text-[10px] font-mono opacity-40">
              {{ room.players ? room.players.length : 0 }}/{{ room.game.max_players }} Joueurs
            </p>
          </div>
        </button>
      </template>

      <div v-if="!props.rooms || props.rooms.length === 0" class="py-8 text-center text-white/20 text-xs italic">
        Aucun salon disponible...
      </div>
    </div>
  </div>
</template>
