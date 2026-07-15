import {
  ref,
  onMounted,
  onBeforeUnmount,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'

export interface ParallaxOptions {
  /** Vitesse relative du calque (0 = statique, 1 ≈ vitesse "normale") */
  speed?: MaybeRefOrGetter<number>
  /** Sens du déplacement par rapport au scroll */
  direction?: MaybeRefOrGetter<'up' | 'down'>
  /** rootMargin de l'IntersectionObserver (active l'effet un peu avant que l'élément soit visible) */
  rootMargin?: string
  /** Permet de couper l'effet dynamiquement (mobile, reduced-motion manuel, etc.) */
  enabled?: MaybeRefOrGetter<boolean>
}

const subscribers = new Set<() => void>()
let rafId: number | null = null
let lastScrollY = 0
let listenerActive = false

function tick() {
  rafId = null
  subscribers.forEach((fn) => fn())
}

function onScroll() {
  lastScrollY = window.scrollY
  if (rafId === null) rafId = requestAnimationFrame(tick)
}

function attachListener() {
  if (listenerActive || typeof window === 'undefined') return
  lastScrollY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
  listenerActive = true
}

function detachListenerIfIdle() {
  if (listenerActive && subscribers.size === 0) {
    window.removeEventListener('scroll', onScroll)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    listenerActive = false
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/* ------------------------------------------------------------------ */

export function useParallax(options: ParallaxOptions = {}) {
  const elRef = ref<HTMLElement | null>(null)

  let observer: IntersectionObserver | null = null
  let lastApplied = NaN
  let isSubscribed = false

  const BASE_SCALE = 0.1

  const getMultiplier = () => {
    const speed = toValue(options.speed) ?? 0.2
    const direction = toValue(options.direction) ?? 'up'
    const scaledSpeed = speed * BASE_SCALE
    return direction === 'up' ? -Math.abs(scaledSpeed) : Math.abs(scaledSpeed)
  }

  const isEnabled = () => {
    if (prefersReducedMotion()) return false
    return toValue(options.enabled) ?? true
  }

  function applyTransform(offset: number) {
    const el = elRef.value
    if (!el || Math.abs(offset - lastApplied) < 0.1) return
    lastApplied = offset
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
  }

  function update() {
    if (!isEnabled()) {
      applyTransform(0)
      return
    }
    applyTransform(lastScrollY * getMultiplier())
  }

  function subscribe() {
    if (isSubscribed) return
    attachListener()
    subscribers.add(update)
    isSubscribed = true
    update()
  }

  function unsubscribe() {
    if (!isSubscribed) return
    subscribers.delete(update)
    isSubscribed = false
    detachListenerIfIdle()
    applyTransform(0)
  }

  onMounted(() => {
    const el = elRef.value
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      // Vieux navigateur / environnement sans IO -> on active en continu
      subscribe()
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? subscribe() : unsubscribe()),
      { rootMargin: options.rootMargin ?? '200px' }
    )
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    unsubscribe()
  })

  return { elRef }
}
