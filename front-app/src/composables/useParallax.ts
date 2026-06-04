import { ref, onMounted, onBeforeUnmount, toValue, type MaybeRefOrGetter } from 'vue'

interface ParallaxOptions {
  speed?: MaybeRefOrGetter<number>
  direction?: MaybeRefOrGetter<'up' | 'down'>
  rootMargin?: string
}

const visibleSubscribers = new Set<() => void>()
let globalRafId: number | null = null
let latestScrollY = 0
let isGlobalListenerActive = false

function tick() {
  globalRafId = null
  visibleSubscribers.forEach((updateFn) => updateFn())
}

function onGlobalScroll() {
  latestScrollY = window.scrollY
  if (globalRafId === null) {
    globalRafId = requestAnimationFrame(tick)
  }
}

function ensureGlobalListener() {
  if (!isGlobalListenerActive && typeof window !== 'undefined') {
    latestScrollY = window.scrollY
    window.addEventListener('scroll', onGlobalScroll, { passive: true })
    isGlobalListenerActive = true
  }
}

function releaseGlobalListener() {
  if (isGlobalListenerActive && visibleSubscribers.size === 0) {
    window.removeEventListener('scroll', onGlobalScroll)
    if (globalRafId !== null) {
      cancelAnimationFrame(globalRafId)
      globalRafId = null
    }
    isGlobalListenerActive = false
  }
}

export function useParallax(options: ParallaxOptions = {}) {
  const elRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  let lastApplied = NaN

  const getMultiplier = () => {
    const speed = toValue(options.speed) ?? 0.2
    const direction = toValue(options.direction) ?? 'up'
    return direction === 'up' ? -Math.abs(speed) : Math.abs(speed)
  }

  function update() {
    const el = elRef.value
    if (!el) return

    const offset = latestScrollY * getMultiplier()

    if (Math.abs(offset - lastApplied) < 0.1) return

    lastApplied = offset
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
  }

  onMounted(() => {
    const el = elRef.value
    if (!el) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ensureGlobalListener()
          visibleSubscribers.add(update)
          update()
        } else {
          visibleSubscribers.delete(update)
          releaseGlobalListener()
        }
      },
      { rootMargin: options.rootMargin ?? '200px' }
    )

    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    visibleSubscribers.delete(update)
    releaseGlobalListener()
  })

  return { elRef }
}
