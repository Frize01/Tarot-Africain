import { ref, computed } from 'vue'

const userState = ref<any>(
  localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
)

export function useAuth() {
  // isLoggedIn = a une session (invité OU vrai compte) → sert au flux de jeu
  const isLoggedIn = computed(() => !!userState.value)
  // invité = pseudo temporaire, PAS un compte
  const isGuest = computed(() => !!userState.value?.is_guest)
  // vrai compte authentifié (ni déconnecté, ni invité)
  const isAuthenticated = computed(() => !!userState.value && !userState.value.is_guest)

  const user = computed(() => userState.value)

  function loginUser(userData: any) {
    userState.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logoutUser() {
    userState.value = null
    localStorage.removeItem('user')
  }

  return {
    user,
    isLoggedIn,
    isGuest,
    isAuthenticated,
    loginUser,
    logoutUser
  }
}
