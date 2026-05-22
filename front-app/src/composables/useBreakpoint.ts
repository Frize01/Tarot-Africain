import { ref, computed, onMounted, onUnmounted } from 'vue'

// configs breakpoints différent format
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/** Detecte la taille de l'écran et update les breakpoints
 * @return { windowWidth, windowHeight, isSmallScreen, isMobile, isTablet, sm, md, lg, xl, xxl }
*/
export function useBreakpoint() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  const onResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  const isSmallScreen = computed(() => windowWidth.value < 480 || windowHeight.value < 480)
  const isMobile = computed(() => windowWidth.value < breakpoints.sm)
  const isTablet = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)

  const sm = computed(() => windowWidth.value >= breakpoints.sm)
  const md = computed(() => windowWidth.value >= breakpoints.md)
  const lg = computed(() => windowWidth.value >= breakpoints.lg)
  const xl = computed(() => windowWidth.value >= breakpoints.xl)
  const xxl = computed(() => windowWidth.value >= breakpoints['2xl'])

  return {
    windowWidth,
    windowHeight,
    isSmallScreen,
    isMobile,
    isTablet,
    isDesktop,
    sm,
    md,
    lg,
    xl,
    xxl
  }
}
