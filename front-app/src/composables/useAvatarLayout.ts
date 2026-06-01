import { computed } from 'vue'
import { useBreakpoint } from './useBreakpoint'
import { useOrientation } from './useOrientation'

export function useAvatarLayout() {
  const { isMobile } = useBreakpoint()
  const { isLandscape } = useOrientation()

  const threePlayerLayout = computed(() => {
    if (isMobile.value && isLandscape.value) {
      return {
        'seat-left':  { left: '14%', top: '36%', translate: '-50% -50%' },
        'seat-right': { right: '14%', top: '36%', translate: '50% -50%' },
      }
    } else if (isMobile.value) { // Portrait
      return {
        'seat-left':  { left: '22%', top: '45%', translate: '-50% -50%' },
        'seat-right': { right: '22%', top: '45%', translate: '50% -50%' },
      }
    } else { // Tablet & Desktop (Fallback obligatoire)
      return {
        'seat-left':  { left: '18%', top: '25%', translate: '-50% -50%' },
        'seat-right': { right: '18%', top: '25%', translate: '50% -50%' },
      }
    }
  })

  const fourPlayerLayout = computed(() => {
    if (isMobile.value && isLandscape.value) {
      return {
        'seat-left':  { left: '11%', top: '40%', translate: '-50% -50%' },
        'seat-right': { right: '11%', top: '40%', translate: '50% -50%' },
        'seat-top':   { left: '18%', top: '23%', translate: '-50% -50%' },
      }
    } else if (isMobile.value) {
      return {
        'seat-left':  { left: '18%', top: '45%', translate: '-50% -50%' },
        'seat-right': { right: '18%', top: '45%', translate: '50% -50%' },
        'seat-top':   { left: '50%', top: '10%', translate: '-50% -50%' },
      }
    } else {
      return {
        'seat-left':  { left: '16%', top: '36%', translate: '-50% -50%' },
        'seat-right': { right: '16%', top: '36%', translate: '50% -50%' },
        'seat-top':   { left: '32%', top: '23%', translate: '-50% -50%' },
      }
    }
  })

  const fivePlayerLayout = computed(() => {
    if (isMobile.value && isLandscape.value) {
      return {
        'seat-left':      { left: '10%', top: '40%', translate: '-50% -50%' },
        'seat-right':     { right: '10%', top: '40%', translate: '50% -50%' },
        'seat-top-left':  { left: '30%', top: '10%', translate: '-50% -50%' },
        'seat-top-right': { right: '30%', top: '10%', translate: '50% -50%' },
      }
    } else if (isMobile.value) {
      return {
        'seat-left-bottom':  { left: '18%', top: '61%', translate: '-50% -50%' },
        'seat-right-bottom': { right: '18%', top: '61%', translate: '50% -50%' },
        'seat-left-top':     { left: '18%', top: '23%', translate: '-50% -50%' },
        'seat-right-top':    { right: '18%', top: '23%', translate: '50% -50%' },
      }
    } else {
      return {
        'seat-left':      { left: '10%', top: '38%', translate: '-50% -50%' },
        'seat-right':     { right: '10%', top: '38%', translate: '50% -50%' },
        'seat-top-left':  { left: '32%', top: '13%', translate: '-50% -50%' },
        'seat-top-right': { right: '32%', top: '13%', translate: '50% -50%' },
      }
    }
  })

  return {
    threePlayerLayout,
    fourPlayerLayout,
    fivePlayerLayout,
  }
}
