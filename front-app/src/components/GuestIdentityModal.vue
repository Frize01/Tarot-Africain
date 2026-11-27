<script setup lang="ts">
import { useGuestIdentity } from '@/composables/useGuestIdentity'

const { showModal, firstname, submitting, submit, cancel } = useGuestIdentity()
</script>

<template>
  <Teleport to="body">
    <Transition name="guest-fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="cancel"
      >
        <div class="w-full max-w-sm rounded-xl border border-white/10 bg-gray-800 p-6 shadow-2xl shadow-black/50">
          <h2 class="text-xl font-bold text-white">Entre ton prénom</h2>
          <p class="mt-1 text-sm text-neutral-400">Pour jouer tout de suite, sans créer de compte.</p>

          <form class="mt-5" @submit.prevent="submit">
            <input
              v-model="firstname"
              type="text"
              placeholder="Ton prénom"
              maxlength="255"
              autofocus
              class="w-full rounded-md border border-neutral-500/60 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-neutral-400 outline-none transition focus:border-white"
            />
            <div class="mt-5 flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-md border border-neutral-500/60 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                @click="cancel"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 rounded-md bg-white py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-50"
              >
                {{ submitting ? '...' : 'Jouer' }}
              </button>
            </div>
          </form>

          <p class="mt-4 text-center text-xs text-neutral-500">
            Tu as déjà un compte ?
            <RouterLink to="/auth" class="text-white underline hover:no-underline" @click="cancel">Se connecter</RouterLink>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.guest-fade-enter-active, .guest-fade-leave-active { transition: opacity 0.2s ease; }
.guest-fade-enter-from, .guest-fade-leave-to { opacity: 0; }
</style>
