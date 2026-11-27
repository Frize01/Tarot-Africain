<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import apiMethods from '@/api'
import { useToast } from 'vue-toastification'

import AppNavbar from '@/components/AppNavbar.vue'
import bushCastle from '@/asset/bushCastle.webp'
import only_castle from '@/asset/only_castle.png'
import only_background from '@/asset/only_background.png'

const { user, isLoggedIn, isGuest, loginUser, logoutUser } = useAuth()
const router = useRouter()
const toast = useToast()

onMounted(() => {
  if (!isLoggedIn.value) return router.replace('/auth')
  // Un invité (pseudo temporaire) n'a pas de compte → pas d'accès à cette page.
  if (isGuest.value) router.replace('/')
})

/* ───────── Identité ───────── */
const initials = computed(() => {
  const f = user.value?.firstname?.[0] ?? ''
  const l = user.value?.lastname?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
})
const fullName = computed(() =>
  [user.value?.firstname, user.value?.lastname].filter(Boolean).join(' ') || 'Joueur',
)

/* ───────── Mon Profil ───────── */
const firstname = ref(user.value?.firstname ?? '')
const lastname = ref(user.value?.lastname ?? '')
const email = ref(user.value?.email ?? '')

watch(user, (u) => {
  firstname.value = u?.firstname ?? ''
  lastname.value = u?.lastname ?? ''
  email.value = u?.email ?? ''
})

const isProfileDirty = computed(
  () =>
    firstname.value !== (user.value?.firstname ?? '') ||
    lastname.value !== (user.value?.lastname ?? '') ||
    email.value !== (user.value?.email ?? ''),
)

const savingProfile = ref(false)
async function saveProfile() {
  if (!isProfileDirty.value || savingProfile.value) return
  savingProfile.value = true
  try {
    const res = await apiMethods.updateProfile({
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      email: email.value.trim(),
    })
    if (res.success) {
      loginUser(res.data.user)
      toast.success('Profil mis à jour ✅')
    } else {
      toast.error(res.message || 'Impossible de mettre à jour le profil')
    }
  } finally {
    savingProfile.value = false
  }
}

/* ───────── Sécurité & Accès ───────── */
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)

async function savePassword() {
  if (savingPassword.value) return
  if (newPassword.value.length < 8) {
    toast.error('Le nouveau mot de passe doit faire au moins 8 caractères.')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error('La confirmation ne correspond pas.')
    return
  }
  savingPassword.value = true
  try {
    const res = await apiMethods.updatePassword({
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
    })
    if (res.success) {
      currentPassword.value = newPassword.value = confirmPassword.value = ''
      toast.success('Mot de passe mis à jour ✅')
    } else {
      toast.error(res.message || 'Mot de passe actuel incorrect')
    }
  } finally {
    savingPassword.value = false
  }
}

/* ───────── Données (à brancher sur l'API plus tard) ───────── */
const stats = [
  { key: 'played', label: 'Parties jouées', value: 0, icon: ['M8 3h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M4 7v12a2 2 0 0 0 2 2h10'] },
  { key: 'wins', label: 'Victoires', value: 0, icon: ['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0Z', 'M17 5h3v2a3 3 0 0 1-3 3', 'M7 5H4v2a3 3 0 0 0 3 3'] },
  { key: 'points', label: 'Points', value: 0, icon: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5', 'M12 6.5v11'] },
]

const recentGames: { title: string; date: string; win: boolean; pts: number }[] = []

const achievements = [
  { title: 'Premier pli', desc: 'Jouer ta première partie', emoji: '🃏', unlocked: false },
  { title: 'Baptême du feu', desc: 'Remporter une partie', emoji: '🏆', unlocked: false },
  { title: 'Habitué', desc: 'Jouer 10 parties', emoji: '🎴', unlocked: false },
  { title: 'Stratège', desc: 'Réussir 5 annonces de suite', emoji: '🥇', unlocked: false },
  { title: 'Invincible', desc: "Gagner 3 parties d'affilée", emoji: '⚔️', unlocked: false },
  { title: 'Légende', desc: 'Atteindre 1 000 points', emoji: '👑', unlocked: false },
]
const unlockedCount = computed(() => achievements.filter((a) => a.unlocked).length)

const fmt = (n: number) => n.toLocaleString('fr-FR')

/* ───────── Navigation ───────── */
const activeNav = ref('dashboard')
const nav = [
  { key: 'dashboard', label: 'Tableau de bord', icon: ['M3 10.5 12 3l9 7.5', 'M5 9v11h5v-6h4v6h5V9'] },
  { key: 'games', label: 'Mes Parties', icon: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'] },
  { key: 'profile', label: 'Mon Profil', icon: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'] },
  { key: 'security', label: 'Sécurité & Accès', icon: ['M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z', 'M8 11V7a4 4 0 0 1 8 0v4'] },
]
const pageTitle = computed(
  () => ({ dashboard: 'Mon Compte', profile: 'Mon Profil', security: 'Sécurité & Accès' } as Record<string, string>)[activeNav.value] ?? 'Mon Compte',
)

function selectNav(key: string) {
  if (['dashboard', 'profile', 'security'].includes(key)) activeNav.value = key
  else toast.info('Fonctionnalité à venir 🙂')
}

/* ───────── Déconnexion ───────── */
const loggingOut = ref(false)
async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    const result = await apiMethods.logout()
    if (result.success) {
      logoutUser()
      toast.success('À bientôt !')
      router.push('/')
    } else {
      toast.error(result.message || 'Erreur lors de la déconnexion')
    }
  } finally {
    loggingOut.value = false
  }
}

/* ───────── Styles partagés (alignés sur la page /auth) ───────── */
const panel = 'rounded-xl border border-white/10 bg-gray-800/90 shadow-2xl shadow-black/40'
const tile = 'rounded-lg border border-white/10 bg-neutral-900/40'
const label = 'mb-1.5 block text-xs font-medium text-neutral-400'
const input = 'w-full rounded-md border border-neutral-500/60 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-neutral-400 outline-none transition focus:border-white'
const btnPrimary = 'rounded-md bg-white text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50'
const btnOutline = 'rounded-md border border-neutral-500/60 text-xs font-semibold text-white transition hover:border-white hover:bg-white hover:text-neutral-900'
</script>

<template>
  <AppNavbar />

  <!-- Fond paysage château (fixe) -->
  <div class="fixed inset-0 -z-10 bg-[#0d1420]">
    <img :src="only_background" alt="" class="absolute inset-0 h-full w-full object-cover object-bottom" />
    <img :src="only_castle" alt="" class="absolute inset-0 h-full w-full object-cover object-bottom brightness-75" />
    <img :src="bushCastle" alt="" class="absolute inset-0 h-full w-full object-cover object-bottom brightness-10" />
  </div>

  <main class="relative min-h-screen text-white">
    <div class="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <div class="grid gap-4 lg:grid-cols-[250px_1fr]">

        <!-- ═════════ Sidebar ═════════ -->
        <aside :class="panel" class="flex flex-col p-5 lg:h-full">
          <div class="flex flex-col items-center pt-2 text-center">
            <div class="grid h-20 w-20 place-items-center rounded-full border-4 border-white/80 bg-gradient-to-br from-neutral-500 to-neutral-800 text-2xl font-bold shadow-lg">
              {{ initials }}
            </div>
            <h2 class="mt-3 text-lg font-bold">{{ fullName }}</h2>
            <p class="text-sm text-neutral-400">Chevalier des Cartes</p>
          </div>

          <nav class="mt-6 flex flex-col gap-1 rounded-lg bg-neutral-900/60 p-1">
            <button
              v-for="item in nav"
              :key="item.key"
              class="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors"
              :class="activeNav === item.key
                ? 'bg-black text-white shadow'
                : 'text-neutral-300 hover:bg-white/5 hover:text-white'"
              @click="selectNav(item.key)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0">
                <path v-for="(d, i) in item.icon" :key="i" :d="d" />
              </svg>
              {{ item.label }}
            </button>
          </nav>

          <button
            class="mt-2 flex items-center gap-3 rounded-md px-4 py-2.5 text-left text-sm font-semibold text-neutral-300 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" />
            </svg>
            {{ loggingOut ? 'Déconnexion…' : 'Déconnexion' }}
          </button>
        </aside>

        <!-- ═════════ Contenu ═════════ -->
        <div :class="panel" class="flex flex-col gap-4 p-4 sm:p-6">
          <h1 class="text-3xl font-bold tracking-tight">{{ pageTitle }}</h1>

          <!-- ───── Tableau de bord ───── -->
          <template v-if="activeNav === 'dashboard'">
            <!-- Statistiques -->
            <section :class="tile" class="p-5">
              <h3 class="mb-4 text-lg font-bold">Statistiques de jeu</h3>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="s in stats" :key="s.key"
                     class="flex flex-col items-center rounded-lg border border-white/10 bg-neutral-800/80 px-2 py-5 text-center transition hover:border-white/30">
                  <span class="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                      <path v-for="(d, i) in s.icon" :key="i" :d="d" />
                    </svg>
                  </span>
                  <span class="mt-3 text-xs text-neutral-400">{{ s.label }}</span>
                  <span class="mt-0.5 text-2xl font-bold tabular-nums">{{ fmt(s.value) }}</span>
                </div>
              </div>
            </section>

            <div class="grid gap-4 md:grid-cols-[1.45fr_1fr]">
              <!-- Dernières parties -->
              <section :class="tile" class="p-5">
                <h3 class="mb-4 text-lg font-bold">Mes dernières parties</h3>

                <ul v-if="recentGames.length" class="flex flex-col gap-2">
                  <li v-for="(g, i) in recentGames" :key="i"
                      class="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-neutral-800/80 px-4 py-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold">
                        {{ g.title }} —
                        <span :class="g.win ? 'text-emerald-400' : 'text-red-400'">
                          {{ g.win ? 'Victoire' : 'Défaite' }} ({{ g.pts > 0 ? '+' : '' }}{{ g.pts }} pts)
                        </span>
                      </p>
                      <p class="text-xs text-neutral-400">{{ g.date }}</p>
                    </div>
                    <button :class="btnOutline" class="shrink-0 px-3 py-1.5" @click="toast.info('Fonctionnalité à venir 🙂')">
                      Revoir les détails
                    </button>
                  </li>
                </ul>

                <div v-else class="flex flex-col items-center rounded-lg border border-dashed border-white/15 px-4 py-10 text-center">
                  <p class="text-sm font-semibold">Aucune partie pour l'instant</p>
                  <p class="mt-1 text-xs text-neutral-400">Lance ta première partie pour remplir ton historique.</p>
                  <button :class="btnPrimary" class="mt-4 px-5 py-2.5" @click="router.push('/')">
                    Lancer une partie
                  </button>
                </div>
              </section>

              <!-- Succès -->
              <section :class="tile" class="p-5">
                <div class="mb-4 flex items-baseline justify-between">
                  <h3 class="text-lg font-bold">Succès</h3>
                  <span class="text-xs text-neutral-400">{{ unlockedCount }} / {{ achievements.length }}</span>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div v-for="a in achievements" :key="a.title"
                       class="group relative grid aspect-square place-items-center rounded-lg border border-white/10 bg-neutral-800/80 transition hover:border-white/30"
                       :title="`${a.title} — ${a.desc}`">
                    <span class="text-3xl transition group-hover:scale-110"
                          :class="a.unlocked ? '' : 'opacity-30 grayscale'">
                      {{ a.emoji }}
                    </span>
                    <svg v-if="!a.unlocked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round"
                         class="absolute bottom-1.5 right-1.5 h-3 w-3 text-neutral-500">
                      <rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </div>
                </div>
                <p class="mt-3 text-center text-xs text-neutral-500">Survole un succès pour voir comment le débloquer.</p>
              </section>
            </div>
          </template>

          <!-- ───── Mon Profil ───── -->
          <template v-else-if="activeNav === 'profile'">
            <section :class="tile" class="max-w-xl p-5 sm:p-6">
              <h3 class="mb-1 text-lg font-bold">Informations personnelles</h3>
              <p class="mb-5 text-xs text-neutral-400">Ces informations te représentent auprès des autres joueurs.</p>

              <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label :class="label">Prénom</label>
                    <input v-model="firstname" type="text" autocomplete="given-name" :class="input" />
                  </div>
                  <div>
                    <label :class="label">Nom</label>
                    <input v-model="lastname" type="text" autocomplete="family-name" :class="input" />
                  </div>
                </div>
                <div>
                  <label :class="label">Email</label>
                  <input v-model="email" type="email" autocomplete="email" :class="input" />
                </div>

                <div class="mt-1 flex items-center gap-3">
                  <button type="submit" :class="btnPrimary" class="px-5 py-2.5" :disabled="!isProfileDirty || savingProfile">
                    {{ savingProfile ? 'Enregistrement…' : 'Enregistrer' }}
                  </button>
                  <span v-if="isProfileDirty" class="text-xs text-neutral-400">Modifications non enregistrées</span>
                </div>
              </form>
            </section>
          </template>

          <!-- ───── Sécurité & Accès ───── -->
          <template v-else-if="activeNav === 'security'">
            <section :class="tile" class="max-w-xl p-5 sm:p-6">
              <h3 class="mb-1 text-lg font-bold">Changer le mot de passe</h3>
              <p class="mb-5 text-xs text-neutral-400">Au moins 8 caractères. Tu resteras connecté après le changement.</p>

              <form class="flex flex-col gap-4" @submit.prevent="savePassword">
                <div>
                  <label :class="label">Mot de passe actuel</label>
                  <input v-model="currentPassword" type="password" autocomplete="current-password" :class="input" />
                </div>
                <div>
                  <label :class="label">Nouveau mot de passe</label>
                  <input v-model="newPassword" type="password" autocomplete="new-password" :class="input" />
                </div>
                <div>
                  <label :class="label">Confirmer le nouveau mot de passe</label>
                  <input v-model="confirmPassword" type="password" autocomplete="new-password" :class="input" />
                </div>

                <button type="submit" :class="btnPrimary" class="w-fit px-5 py-2.5" :disabled="savingPassword">
                  {{ savingPassword ? 'Mise à jour…' : 'Mettre à jour le mot de passe' }}
                </button>
              </form>
            </section>
          </template>
        </div>

      </div>
    </div>
  </main>
</template>
