import { ref, onMounted, onUnmounted } from 'vue'

/** Detecte l'orientation de l'écran et update isLandscape
 * @return { isLandscape }
*/
export function useOrientation() {
  const isLandscape = ref(
    window.matchMedia('(orientation: landscape)').matches
  )

  const mq = window.matchMedia('(orientation: landscape)')

  const handler = (e: MediaQueryListEvent) => { isLandscape.value = e.matches }

  onMounted(() => mq.addEventListener('change', handler))

  // console.log(isLandscape.value ? 'hori' : 'verti')
  onUnmounted(() => mq.removeEventListener('change', handler))

  return { isLandscape }
}
