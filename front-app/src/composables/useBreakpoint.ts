// import { ref, computed, onMounted, onUnmounted } from 'vue'

// const breakpoints = {
//   sm: 640,
//   lg: 1024,
// }

// const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
// const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

// let listenerCount = 0
// let rAFId = null

// const onResize = () => {
//   if (rAFId) return
//   rAFId = requestAnimationFrame(() => {
//     windowWidth.value = window.innerWidth
//     windowHeight.value = window.innerHeight
//     rAFId = null
//   })
// }

// export function useBreakpoint() {
//   onMounted(() => {
//     if (typeof window !== 'undefined') {
//       if (listenerCount === 0) {
//         window.addEventListener('resize', onResize, { passive: true })
//         windowWidth.value = window.innerWidth
//         windowHeight.value = window.innerHeight
//       }
//       listenerCount++
//     }
//   })

//   onUnmounted(() => {
//     if (typeof window !== 'undefined') {
//       listenerCount--
//       if (listenerCount === 0) {
//         window.removeEventListener('resize', onResize)
//       }
//     }
//   })

//   const isMobile = computed(() => windowWidth.value < breakpoints.sm || windowHeight.value < 480)
//   const isTablet = computed(() => !isMobile.value && windowWidth.value < breakpoints.lg)
//   const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)

//   return {
//     windowWidth,
//     windowHeight,
//     isMobile,
//     isTablet,
//     isDesktop
//   }
// }


import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

  const update = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  const isPortrait = computed(() => height.value > width.value)

  const scaleFactor = computed(() => {
    const baseWidth = 1280
    return Math.min(width.value / baseWidth, 1.2)
  })

  return {
    width,
    height,
    isPortrait,
    scaleFactor,
    isMobile: computed(() => width.value < 768),
    isTablet: computed(() => width.value >= 768 && width.value < 1024),
    isDesktop: computed(() => width.value >= 1024),

  }
}
