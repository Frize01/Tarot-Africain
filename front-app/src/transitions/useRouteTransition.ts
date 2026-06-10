import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

const transitionImporters: Record<string, () => Promise<any>> = {
  split: () => import('@/transitions/template/SplitRowsTransition.vue'),
  fade:  () => import('@/transitions/template/SplitRowsTransition.vue'),
}

import DefaultTransition from '@/transitions/template/SplitRowsTransition.vue'

export function useRouteTransition() {
  const activeOverlay              = ref<any>(null)
  const transitionColor            = ref('#000000')
  const currentTransitionComponent = shallowRef<any>(DefaultTransition)
  const isAnimating                = ref(false)

  const router = useRouter()

  router.beforeEach(async (to) => {
    //bloque nav si transition
    if (isAnimating.value){
      console.warn('Navigation blocked during transition animation')
      return false
    }

    if (!to.meta.transition) return true

    const type = (to.meta.transitionType as string) || 'split'

    if (typeof to.meta.transitionColor === 'string') {
      transitionColor.value = to.meta.transitionColor
    }

    const importer = transitionImporters[type]
    if (importer) {
      const mod = await importer()
      currentTransitionComponent.value = mod.default
    }

    isAnimating.value = true
    await activeOverlay.value?.leave?.()

    return true
  })

  router.afterEach((to) => {
    if (!to.meta.transition) {
      isAnimating.value = false
      return
    }

    const tryEnter = () => {
      if (activeOverlay.value) {
        activeOverlay.value.enter().then(() => {
          isAnimating.value = false
        })
      } else {
        requestAnimationFrame(tryEnter)
      }
    }
    requestAnimationFrame(tryEnter)
  })

  return { activeOverlay, transitionColor, currentTransitionComponent }
}
