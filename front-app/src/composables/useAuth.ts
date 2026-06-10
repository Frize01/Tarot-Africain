import { ref, computed } from 'vue'

const userState = ref<any>(
  localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
)

export function useAuth() {
  const isLoggedIn = computed(() => !!userState.value)

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
    loginUser,
    logoutUser
  }
}
