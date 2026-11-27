import { ref } from 'vue'
import apiMethods from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from 'vue-toastification'

/**
 * Identité "invité" — permet de jouer sans compte.
 * `ensureIdentity()` : si déjà connecté → true ; sinon ouvre une modale qui
 * demande le prénom, crée l'utilisateur invité, et résout quand c'est fait.
 * État au niveau module → partagé entre la modale (App.vue) et les vues.
 */
const showModal = ref(false)
const firstname = ref('')
const submitting = ref(false)
let resolver: ((ok: boolean) => void) | null = null

export function useGuestIdentity() {
  const { isLoggedIn, loginUser } = useAuth()
  const toast = useToast()

  function ensureIdentity(): Promise<boolean> {
    if (isLoggedIn.value) return Promise.resolve(true)
    firstname.value = ''
    showModal.value = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  async function submit() {
    const name = firstname.value.trim()
    if (!name) {
      toast.error('Entre ton prénom pour jouer.')
      return
    }
    if (submitting.value) return
    submitting.value = true
    try {
      await apiMethods.getCsrfCookie()
      const res = await apiMethods.guestLogin(name)
      if (res.success) {
        loginUser(res.data.user)
        showModal.value = false
        resolver?.(true)
        resolver = null
      } else {
        toast.error(res.message || 'Impossible de créer la session invité.')
      }
    } catch {
      toast.error('Impossible de créer la session invité.')
    } finally {
      submitting.value = false
    }
  }

  function cancel() {
    showModal.value = false
    resolver?.(false)
    resolver = null
  }

  return { showModal, firstname, submitting, ensureIdentity, submit, cancel }
}
