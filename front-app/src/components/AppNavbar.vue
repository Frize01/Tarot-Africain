<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

import VButton from '@/components/VButton.vue'
import VInput from '@/components/VInput.vue'

import { useAuth } from '@/composables/useAuth'

import logo from '@/asset/logo_app.png'

const { isLoggedIn, user, logoutUser } = useAuth()
const router = useRouter()
const search = ref('')

const closeMenu = () => {
  const elem = document.activeElement as HTMLElement
  if (elem) {
    elem.blur()
  }
}

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

</script>

<template>
  <!--
    <header
      class="fixed top-0 z-50 w-full transition-all duration-300"
      :class="[
        isScrolled
          ? 'display:none;'
          : 'bg-transparent py-4'
      ]"
    >-->


        <header
          class="fixed top-0 z-50 w-full transition-all duration-300"
          :class="[
          isScrolled
            ? 'bg-black/60 backdrop-blur-md'
            : 'bg-transparent py-4'
        ]"
        >

    <div class="navbar px-4 lg:px-8 min-h-0">

      <div class="navbar-start">
        <div class="dropdown lg:hidden">
          <label tabindex="0" class="btn btn-ghost text-white relative z-40">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>

          <ul
            tabindex="0"
            class="dropdown-content menu menu-sm fixed top-0 left-0 m-0 w-screen h-screen backdrop-blur-md bg-black/80 z-[100] px-6 pt-24 shadow-2xl"
          >
            <button
              @click="closeMenu"
              class="absolute top-4 left-4 btn btn-ghost text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <li class="sm:hidden mb-4">
              <VInput
                v-model="search"
                placeholder="Rechercher..."
                class="w-full input-transparent text-white border border-white/20"
              />
            </li>

            <li>
              <!-- <RouterLink to="/categories" class="text-white text-2xl py-4" @click="closeMenu">
                Catégories
              </RouterLink> -->
              <span class="text-white text-2xl py-4" aria-disabled="true">
                Catégories
              </span>
            </li>
            <li>
              <!-- <RouterLink to="/about" class="text-white text-2xl py-4" @click="closeMenu">
                À propos
              </RouterLink> -->
              <span class="text-white text-2xl py-4" aria-disabled="true">
                À propos
              </span>
            </li>
          </ul>
        </div>

        <RouterLink to="/" class="btn btn-ghost text-xl text-white normal-case">LOGO</RouterLink>
        <!-- <RouterLink to="/" class="flex items-center gap-2">
          <img :src="logo" alt="Logo" class="h-32 w-48" />
        </RouterLink> -->

      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 text-white">
          <!-- <li><RouterLink to="/categories">Catégories</RouterLink></li>
          <li><RouterLink to="/about">À propos</RouterLink></li> -->
          <li><span aria-disabled="true">Catégories</span></li>
          <li><span aria-disabled="true">À propos</span></li>
        </ul>
      </div>

      <div class="navbar-end flex gap-2">
        <VInput
          v-model="search"
          placeholder="Rechercher..."
          type="text"
          class="hidden sm:flex max-w-xs input-transparent text-white border border-white/20"
          style="max-width: 12em;"
        />

        <VButton v-if="!isLoggedIn"
          ariaLabel="Se connecter"
          class="text-white bg-transparent hover:bg-white/10"
          @click="router.push('/auth')"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9">
              <circle cx="12" cy="7.25" r="5.73" />
              <path d="M1.5,23.48l.37-2.05A10.3,10.3,0,0,1,12,13h0a10.3,10.3,0,0,1,10.13,8.45l.37,2.05" />
            </svg>
          </template>
          Se connecter
        </VButton>

        <VButton v-else
          ariaLabel="Mon Compte"
          class="text-white bg-transparent hover:bg-white/10"
          @click="router.push('/account')"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9">
              <circle cx="12" cy="7.25" r="5.73" />
              <path d="M1.5,23.48l.37-2.05A10.3,10.3,0,0,1,12,13h0a10.3,10.3,0,0,1,10.13,8.45l.37,2.05" />
            </svg>
          </template>
          Mon Compte
        </VButton>
      </div>

    </div>
  </header>
</template>

<style scoped>
.dropdown .dropdown-content {
  margin: 0 !important;
  border-radius: 0 !important;
}

.dropdown-content li a {
  color: white !important;
}
</style>
