<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import VButton from '@/components/VButton.vue'
import VInput from '@/components/VInput.vue'

const router = useRouter()
const search = ref('')
</script>

<template>
<header class="fixed top-0 z-50 w-full bg-transparent">
    <div class="navbar px-4 lg:px-8 min-h-0 bg-transparent">

      <div class="navbar-start">
        <div class="dropdown lg:hidden">
          <label tabindex="0" class="btn btn-ghost text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>

          <ul
            tabindex="0"
            class="dropdown-content menu menu-sm fixed left-0 right-0 top-0 w-full h-screen backdrop-blur-md bg-black/40 z-[50] px-4 pt-20 pb-4 shadow-2xl"
          >
            <li class="sm:hidden py-2">
              <VInput
                v-model="search"
                placeholder="Rechercher..."
                autocomplete="off"
                class="w-full"
                color="transparent"

              />
            </li>
            <li><RouterLink to="/categories" class="text-white text-lg">Catégories</RouterLink></li>
            <li><RouterLink to="/about" class="text-white text-lg">À propos</RouterLink></li>
          </ul>
        </div>

        <RouterLink to="/" class="btn btn-ghost text-xl text-white normal-case">logo</RouterLink>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 text-white">
          <li><RouterLink to="/categories">Catégories</RouterLink></li>
          <li><RouterLink to="/about">À propos</RouterLink></li>
        </ul>
      </div>

      <div class="navbar-end flex gap-2">
        <VInput
          v-model="search"
          placeholder="Rechercher..."
          autocomplete="off"
          color="transparent"
          class="w-64 lg:w-auto hidden sm:flex" />
        <VButton
          ariaLabel="Se connecter"
          textColor="text-white"
          color="transparent"
          class="gap-2"
          @click="router.push('/auth')">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9">
              <circle cx="12" cy="7.25" r="5.73" />
              <path d="M1.5,23.48l.37-2.05A10.3,10.3,0,0,1,12,13h0a10.3,10.3,0,0,1,10.13,8.45l.37,2.05" />
            </svg>
          </template>
          Se connecter
        </VButton>
      </div>

    </div>
  </header>
</template>

<style scoped>
.dropdown-content li a {
  color: white !important;
}
</style>
