<script setup lang="ts">
import { ref } from 'vue'
import { GAMES_DATA } from '../data/games'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useRoute } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import DungeonSection from '@/components/DungeonSection.vue'
import ReturnBtn from '@/components/ReturnBtn.vue'

const route = useRoute()
const gameId = ref(route.params.gameId)
const qrUrl = ref(`${import.meta.env.VITE_API_URL}/tarot_africain/lobby/${gameId.value}`)
const game = GAMES_DATA['tarot_africain']
</script>

<template>
  <AppNavbar />
  <DungeonSection vignette>
    <div class="flex items-center justify-center px-4 mt-32">

      <div class="grid md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch">

        <div class="bg-black/50 p-8 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center text-center gap-6 border border-white/10">
          <h2 class="text-2xl font-bold tracking-wider uppercase mt-8 sm:mt-0">
            Code : {{ gameId }}
          </h2>
          <div class="p-3 bg-white rounded-lg shadow-xl">
            <QrcodeVue :value="qrUrl" :size="200" />
          </div>
          <p class="text-base font-medium text-gray-200 balance">
            Partagez ce QR code pour inviter vos amis !<br />
            Ou utilisez le code pour rejoindre la partie depuis l'application.
          </p>
          <ReturnBtn route-name="TarotAfricain" class="absolute left-4 top-4 "/>
        </div>

        <div class="bg-black/50 p-8 rounded-xl backdrop-blur-sm flex flex-col gap-4 border border-white/10">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-2xl font-bold tracking-wider uppercase">
              Joueurs
            </h2>
            <span class="bg-amber-500/20 text-sm font-bold px-3 py-1 rounded-full border border-amber-500/30">
              1 / {{ game.playerCount.max }}
            </span>
          </div>

          <div class="space-y-3 flex-1 flex flex-col justify-between">

            <div class="flex items-center justify-between p-4 rounded-lg bg-white/10 border border-white/20">
              <div class="flex items-center gap-3">
                <div class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span class="font-semibold">Joueur 1 (Vous)</span>
              </div>
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" viewBox="0 0 1280.000000 815.000000" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,815.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                  <path d="M6224 8131 c-137 -37 -202 -83 -331 -229 -139 -159 -190 -310 -179 -527 9 -184 62 -316 185 -461 38 -44 91 -97 118 -117 55 -40 169 -97 195 -97 9 0 19 -4 22 -9 10 -16 -743 -2610 -779 -2686 -48 -100 -88 -150 -141 -176 -41 -19 -50 -20 -86 -10 -55 17 -124 88 -185 191 -27 47 -343 465 -702 929 l-652 845 46 39 c209 179 315 387 315 617 0 172 -47 303 -159 442 -132 164 -238 240 -389 279 -133 34 -263 18 -402 -49 -58 -28 -93 -55 -159 -122 -136 -139 -209 -256 -242 -390 -17 -71 -17 -249 0 -320 19 -77 81 -207 132 -276 116 -158 250 -254 404 -291 39 -9 71 -17 72 -18 3 -2 -194 -1964 -203 -2020 -12 -74 -54 -192 -84 -233 -75 -104 -178 -97 -335 23 -38 29 -385 259 -770 510 -385 251 -706 463 -713 470 -11 10 -8 21 22 63 142 197 175 498 79 726 -83 199 -274 374 -468 432 -73 21 -217 24 -295 5 -30 -7 -93 -31 -140 -53 -71 -35 -100 -56 -180 -137 -74 -74 -105 -115 -137 -176 -68 -131 -78 -178 -78 -355 0 -135 3 -165 24 -230 98 -314 354 -513 661 -513 109 -1 171 15 268 68 35 20 65 35 67 33 5 -7 275 -516 383 -723 327 -629 481 -1071 562 -1610 6 -38 13 -82 16 -98 l6 -27 4398 0 4397 0 7 52 c12 95 76 400 112 535 77 294 201 611 374 962 103 209 458 890 471 905 4 5 21 -1 37 -13 80 -56 244 -98 346 -87 174 20 302 81 426 206 47 47 100 111 119 142 197 336 129 725 -172 978 -77 65 -183 121 -267 141 -71 17 -200 17 -270 0 -127 -31 -278 -131 -375 -249 -124 -150 -172 -298 -162 -504 7 -163 52 -301 134 -416 25 -36 30 -49 20 -58 -6 -6 -330 -218 -718 -471 -388 -254 -737 -485 -775 -514 -89 -67 -137 -89 -200 -89 -94 0 -157 69 -194 214 -14 57 -48 371 -115 1089 -52 555 -95 1013 -95 1018 0 5 7 9 14 9 38 0 179 54 233 89 118 76 246 231 299 363 69 168 72 395 7 558 -39 98 -87 165 -193 271 -107 107 -188 155 -315 185 -135 31 -299 2 -432 -78 -70 -42 -202 -174 -258 -258 -147 -223 -146 -563 4 -792 49 -76 137 -171 206 -225 l40 -30 -31 -39 c-288 -365 -1292 -1681 -1329 -1743 -56 -93 -138 -175 -185 -184 -77 -16 -158 60 -216 203 -12 30 -76 240 -142 465 -66 226 -238 810 -382 1300 -143 489 -258 895 -256 902 3 7 12 13 20 13 7 0 51 18 96 41 100 50 237 180 294 279 116 199 139 467 59 670 -74 188 -263 377 -432 431 -96 31 -271 36 -367 10z"/>
                  <path d="M1990 660 l0 -660 4395 0 4395 0 2 660 3 660 -4397 0 -4398 0 0 -660z"/>
                </g>
              </svg>
            </div>

            <div v-for="i in game.playerCount.max - 1" :key="i" class="flex items-center justify-center p-4 rounded-lg bg-black/30 border border-dashed border-white/20 text-gray-500 italic text-sm">
              En attente d'un joueur...
            </div>

          </div>
        </div>

      </div>

    </div>
  </DungeonSection>
  <AppFooter />
</template>
