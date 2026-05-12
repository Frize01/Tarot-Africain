<script setup lang="ts">
import { ref } from 'vue'

import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

import { RouterLink } from 'vue-router'

import AnimedBackground from '@/components/AnimedBackground.vue'

type Tab = 'signup' | 'signin'
const tab = ref<Tab>('signup')
</script>

<template>
  <!-- <AppNavbar /> -->
  <!-- <main
    class="min-h-screen min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative"
    style="background-image: url('');"
  > -->
  <AnimedBackground>
    <!-- <div class="absolute inset-0 bg-black/20 pointer-events-none" ></div> -->

    <section class="relative w-full max-w-md sm:max-w-lg xl:max-w-xl">
      <div class="card bg-base-100/70 backdrop-blur-xl shadow-2xl">
        <div class="card-body gap-5 p-5 sm:p-8">
          <RouterLink to="/" class="absolute -top-10 left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0">
            <div class="avatar">
              <div class="w-20 h-20 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 shadow-2xl">
                <img src="https://img.daisyui.com/images/store/large/auth/auth@2-4.webp" alt="Logo" />
              </div>
            </div>
          </RouterLink>
          <div class="flex justify-center mt-8 sm:mt-0">
            <div class="bg-base-200/70 p-1 rounded-xl inline-flex gap-1">
              <button
                class="btn btn-sm rounded-lg min-w-[5rem]"
                :class="tab === 'signup' ? 'btn-neutral' : 'btn-ghost'"
                @click="tab = 'signup'"
                type="button"
              >
                Inscription
              </button>
              <button
                class="btn btn-sm rounded-lg min-w-[5rem]"
                :class="tab === 'signin' ? 'btn-neutral' : 'btn-ghost'"
                @click="tab = 'signin'"
                type="button"
              >
                Connexion
              </button>
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
            {{ tab === 'signup' ? 'Créer un compte' : 'Connectez-vous' }}
          </h1>

          <Register v-if="tab === 'signup'" key="signup" />

          <Login v-else key="signin" />

        </div>
      </div>
    </section>
  </AnimedBackground>
  <!-- </main> -->
  <!-- <AppFooter /> -->
</template>
