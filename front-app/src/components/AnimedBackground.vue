<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
let spawnTimer: number | null = null

const svgIcons = [
  // Tréfle
  `<svg viewBox="-120 -168 240 336" fill="black"><defs><symbol id="club" viewBox="-600 -600 1200 1200"><path d="M-100 500L100 500L100 340A260 260 0 1 0 200 -150A230 230 0 1 0 -200 -150A260 260 0 1 0 -100 340Z"/></symbol></defs><rect width="238" height="334" x="-119" y="-167" rx="12" ry="12" fill="white" stroke="black" stroke-width="2"/><use href="#club" height="60" width="60" x="-95" y="-140"/><use href="#club" height="60" width="60" x="35" y="-140"/><use href="#club" height="60" width="60" x="-95" y="-30"/><use href="#club" height="60" width="60" x="35" y="-30"/><use href="#club" height="60" width="60" x="-95" y="80"/><use href="#club" height="60" width="60" x="35" y="80"/></svg>`,
  // Coeur
  `<svg viewBox="-120 -168 240 336" fill="red"><defs><symbol id="heart" viewBox="-600 -600 1200 1200"><path d="M0 -300A230 230 0 0 1 460 -150C400 0 200 300 0 500C-200 300 -400 0 -460 -150A230 230 0 0 1 0 -300Z"/></symbol></defs><rect width="238" height="334" x="-119" y="-167" rx="12" ry="12" fill="white" stroke="black" stroke-width="2"/><use href="#heart" height="60" width="60" x="-90" y="-140"/><use href="#heart" height="60" width="60" x="30" y="-140"/><use href="#heart" height="60" width="60" x="-90" y="-30"/><use href="#heart" height="60" width="60" x="30" y="-30"/><use href="#heart" height="60" width="60" x="-90" y="80"/><use href="#heart" height="60" width="60" x="30" y="80"/></svg>`,
  // Carreau
  `<svg viewBox="-120 -168 240 336" fill="red"><defs><symbol id="diamond" viewBox="-600 -600 1200 1200"><path d="M-400 0L0 -500L400 0L 0 500Z"/></symbol></defs><rect width="238" height="334" x="-119" y="-167" rx="12" ry="12" fill="white" stroke="black" stroke-width="2"/><use href="#diamond" height="60" width="60" x="-95" y="-140"/><use href="#diamond" height="60" width="60" x="35" y="-140"/><use href="#diamond" height="70" width="70" x="-35" y="-35"/><use href="#diamond" height="60" width="60" x="-95" y="80"/><use href="#diamond" height="60" width="60" x="35" y="80"/></svg>`,
  // Pique
  `<svg viewBox="-120 -168 240 336" fill="black"><defs><symbol id="spade4" viewBox="-600 -600 1200 1200"><path d="M0 -500C350 -250 460 -100 460 100C460 300 260 340 210 340C110 340 55 285 100 300L130 500L-130 500L-100 300C-55 285 -110 340 -210 340C-260 340 -460 300 -460 100C-460 -100 -350 -250 0 -500Z"/></symbol></defs><rect width="238" height="334" x="-119" y="-167" rx="12" ry="12" fill="white" stroke="black" stroke-width="2"/><use href="#spade4" height="60" width="60" x="-95" y="-140"/><use href="#spade4" height="60" width="60" x="35" y="-140"/><use href="#spade4" height="60" width="60" x="-95" y="80"/><use href="#spade4" height="60" width="60" x="35" y="80"/></svg>`
]

function spawnRandomElement() {
  if (!containerRef.value) return

  const span = document.createElement('span')
  const isLeftToRight = Math.random() > 0.5
  const minSize = 25
  const maxSize = 160
  const randomSize = minSize + Math.random() * (maxSize - minSize)
  const duration = 7 + (randomSize / 25) + Math.random() * 4

  const heights = ['20%', '30%', '40%', '50%', '60%', '70%', '80%']
  const height = heights[Math.floor(Math.random() * heights.length)] ?? '50%'
  span.style.top = height
  span.style.width = `${randomSize}px`
  span.style.position = 'absolute' // Changé de fixed à absolute
  span.style.zIndex = '0'
  span.style.pointerEvents = 'none'
  span.style.left = isLeftToRight ? `-${randomSize + 50}px` : '100%'

  span.style.animation = `${isLeftToRight ? 'cross-right' : 'cross-left'} ${duration}s linear forwards`
  span.style.opacity = randomSize > 100 ? '0.3' : '0.6'

  const icon = svgIcons[Math.floor(Math.random() * svgIcons.length)] ?? ''
  span.innerHTML = icon

  // On ajoute au conteneur local, pas au body
  containerRef.value.appendChild(span)

  setTimeout(() => {
    if (span.parentNode) span.remove()
  }, duration * 1000)
}

onMounted(() => {
  spawnTimer = window.setInterval(spawnRandomElement, 1800)
})

onUnmounted(() => {
  // Arrête la création de nouvelles cartes
  if (spawnTimer) clearInterval(spawnTimer)
})
</script>

<template>
  <div
    ref="containerRef"
    class="min-h-screen flex items-center justify-center p-4 bg-neutral relative overflow-hidden"
  >
    <div class="relative z-10 w-full flex justify-center">
      <slot />
    </div>
  </div>
</template>

<style>
/* On ajuste les animations pour utiliser 100% (largeur du parent)
   plutôt que vw/px pour être plus précis dans le conteneur
*/
@keyframes cross-right {
  from { left: -200px; transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(180deg) translateY(40px); }
  to { left: 110%; transform: rotate(360deg) translateY(0); }
}

@keyframes cross-left {
  from { left: 110%; transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(-180deg) translateY(-40px); }
  to { left: -200px; transform: rotate(-360deg) translateY(0); }
}
</style>
