<script setup lang="ts">
import { ref } from 'vue'

import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'

import VButton from '@/components/VButton.vue'

import { RouterLink } from 'vue-router'

// import AnimedBackground from '@/components/AnimedBackground.vue'

import HeroSection from '@/components/HeroSection.vue'
import castle from '@/asset/castle.png'

type Tab = 'signup' | 'signin'
const tab = ref<Tab>('signup')
</script>

<template>
  <!-- <AnimedBackground> -->
  <HeroSection :image="castle" class="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black/70" />
    <section class="relative z-10 w-full max-w-md sm:max-w-lg xl:max-w-xl">

      <div class="card bg-base-100/70 backdrop-blur-xl shadow-2xl">
        <div class="card-body gap-5 p-5 sm:p-8">
          <RouterLink to="/" class="absolute -top-10 left-1/2 -translate-x-1/2 sm:-top-12">
            <div class="avatar">
              <div class="w-20 h-20 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 shadow-2xl">
                <img src="https://img.daisyui.com/images/store/large/auth/auth@2-4.webp" alt="Logo" />
              </div>
            </div>
          </RouterLink>
          <div class="flex justify-center mt-8 sm:mt-4">
            <div class="bg-base-100/70 p-1 rounded-xl inline-flex gap-1">

              <VButton
                ariaLabel="S'inscrire"
                size="btn-sm"
                class="rounded-lg min-w-[5rem] transition-colors"
                :class="tab === 'signup'
                  ? 'bg-neutral text-white'
                  : 'bg-transparent text-base-content hover:bg-base-300/50'"
                @click="tab = 'signup'"
              >
                Inscription
              </VButton>

              <VButton
                ariaLabel="Se connecter"
                size="btn-sm"
                class="rounded-lg min-w-[5rem] transition-colors"
                :class="tab === 'signin'
                  ? 'bg-neutral text-white'
                  : 'bg-transparent text-base-content hover:bg-base-300/50'"
                @click="tab = 'signin'"
              >
                Connexion
              </VButton>

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
  </HeroSection>
  <!-- </AnimedBackground> -->
</template>
