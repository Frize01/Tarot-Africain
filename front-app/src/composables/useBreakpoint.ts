import { ref, computed, onMounted, onUnmounted } from 'vue'

const breakpoints = {
  sm: 640,
  lg: 1024,
}

export function useBreakpoint() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

  const onResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  const isMobile = computed(() => windowWidth.value < breakpoints.sm || windowHeight.value < 480)

  const isTablet = computed(() => !isMobile.value && windowWidth.value < breakpoints.lg)

  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop
  }
}
