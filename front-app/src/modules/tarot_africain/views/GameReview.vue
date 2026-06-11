<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { GAMES_DATA } from '../data/games'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import VButton from '@/components/VButton.vue'
// import GameLeaderboard from '@/modules/components/Leaderboard.vue'
import RoomsAvailable from '@/modules/components/RoomsAvailable.vue'

import DungeonSection from '@/components/DungeonSection.vue'
import ReturnBtn from '@/components/ReturnBtn.vue'

import { useLobbyStore } from '../stores/useLobbyStore'

const router = useRouter()
const lobbyStore = useLobbyStore()
import apiMethods from '@/api'

const game = ref([])
const rooms = ref([])

const getGameDetails = async () => {
  try {
    const response = await apiMethods.getGameDetails(1)
    game.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux :', error)
  }
}

const getAvailableRooms = async () => {
  try {
    const response = await apiMethods.getAvailableRooms(1)
    rooms.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des salles disponibles :', error)
  }
}

// const props = defineProps<{ gameId: string }>()
// const game = computed(() => GAMES_DATA[props.gameId as keyof typeof GAMES_DATA])


// async function handleCreateRoom() {
//   await lobbyStore.createRoom("Joueur 1", "#FF5733")
//   router.push(`/tarot_africain/lobby/${lobbyStore.roomId}`)
// }

async function handleCreateRoom() {
  try {
    const response = await apiMethods.createTarotRoom(1)

    if (response.success) {
      console.log('infos reçues du back :', response.data)

      lobbyStore.roomId = response.data.id
      lobbyStore.roomCode = response.data.code

      router.push(`/tarot_africain/lobby/${response.data.code}`)
    } else {
      console.error("Erreur renvoyée par le serveur :", response.message)
    }
  } catch (error) {
    console.error("Erreur lors de la création du salon :", error)
  }
}

async function handleJoinRoomWithCode(joinCode: string) {
  if (!joinCode) return
  const code = joinCode.trim().toUpperCase()
  const randomId = Math.floor(Math.random() * 100)
  await lobbyStore.joinRoom(code, `Joueur ${randomId}`, "#33FF57")
  router.push(`/tarot_africain/lobby/${code}`)
}

// TODO: a faire dans le back
// function generationGameId(){
//   return Math.random().toString(36).substring(2, 8).toUpperCase()
// }

// // TODO: a faire dans le back
// function handleCreateRoom() {
//   const newGameId = generationGameId()
//   router.push(`/tarot_africain/lobby/${newGameId}`)
// }

// // TODO: a faire dans le back, + verif code existe + valide
// function handleJoinRoomWithCode(joinCode: string) {
//   if (!joinCode) return
//   const regex = /^[A-Z0-9]{6}$/
//   let code = joinCode.trim().toUpperCase()
//   if (!regex.test(code)) {
//     alert('Code de salle invalide. Veuillez entrer un code à 6 caractères alphanumériques en majuscules.')
//     return
//   } else{
//     router.push(`/tarot_africain/lobby/${code}`)
//   }
// }



// TODO: socket pour rejoindre une room publique existante (sans code)
function handleJoinPublicRoom(id: string) {
  router.push(`/tarot_africain/lobby/${id}`)
}

onMounted(() => {
  getGameDetails()
  getAvailableRooms()
})

</script>

<template>
  <AppNavbar />

  <DungeonSection top-fade vignette>
    <div class="relative z-20 container mx-auto px-6 md:px-12 lg:px-20 xl:px-32 py-32">
      <div class="grid lg:grid-cols-[1fr_320px] gap-12">
        <section>
          <ReturnBtn routeName="home" class="mb-5"/>
          <p class="font-serif text-orange-700/60 tracking-[0.4em] text-xs mb-3 uppercase">ᚠ ᚨ ᚱ ᛏ ᛟ</p>
          <h1 class="font-luckiest text-6xl md:text-8xl leading-none drop-shadow-2xl">{{ game.name }}</h1>

          <div class="flex items-center gap-4 mt-6">
            <span v-for="tag in game?.tags" :key="tag.id"
              class="px-3 py-1 rounded-full text-[10px] font-bold border border-white/20"
              :style="{ color: tag.color,
                backgroundColor: `color-mix(in srgb, ${tag.color}, #000000 80%)`, }">
              {{ tag.name }}
            </span>
          </div>

          <p class="mt-8 text-white leading-relaxed italic max-w-xl">{{ game.description }}</p>

        </section>
      </div>

      <RoomsAvailable
        class="mt-16"
        :rooms="rooms"
        :gameId="1"
        @create="handleCreateRoom"
        @joinCode="handleJoinRoomWithCode"
        @joinRoom="handleJoinPublicRoom"
      />
    </div>
  </DungeonSection>

  <!-- <AppFooter /> -->

</template>
