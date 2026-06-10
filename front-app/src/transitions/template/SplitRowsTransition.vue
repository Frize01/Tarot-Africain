<template>
  <div
    ref="containerRef"
    class="fixed inset-0 w-screen h-screen flex flex-col pointer-events-none"
    :style="{ zIndex: props.zIndex }"
    aria-hidden="true"
  >
    <div
      v-for="(origin, row) in ['top', 'bottom']"
      :key="origin"
      class="transition-row flex flex-1"
    >
      <div
        v-for="i in props.cols"
        :key="`${origin}-${i}`"
        :ref="el => setBlockRef(el, row, i - 1)"
        class="block flex-1"
        :style="{
          backgroundColor: props.color,
          transformOrigin: origin
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { commonTransitionProps } from '@/transitions/config'
import { animateElements } from '@/transitions/engine'

const props = defineProps({
  ...commonTransitionProps,
  cols: {
    type: Number,
    default: 6
  }
})

const blocks = ref([[], []])

function setBlockRef(el, row, col) {
  if (el) {
    blocks.value[row][col] = el
  }
}

function getAllBlocks() {
  return blocks.value.flat()
}

function runAnimation(fromScale, toScale, easing, direction) {
  const options = {
    ...props,
    easing,
    direction
  }

  return Promise.all(
    blocks.value.map(row =>
      animateElements(row, options, (el, phase, currentDelay) => {
        if (phase === 'prepare') {
          el.style.transform = `scaleY(${fromScale})`
          return
        }

        el.style.transition =
          `transform ${props.duration}ms ${easing} ${currentDelay}ms`

        el.style.transform = `scaleY(${toScale})`
      })
    )
  )
}

async function enter() {
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)'

  await runAnimation(1, 0, easing, 'start')

  getAllBlocks().forEach(el => {
    el.style.visibility = 'hidden'
  })
}

async function leave() {
  getAllBlocks().forEach(el => {
    el.style.visibility = 'visible'
    el.style.transform = 'scaleY(0)'
  })

  await new Promise(resolve => requestAnimationFrame(resolve))

  return runAnimation(
    0,
    1,
    'cubic-bezier(0.33, 1, 0.68, 1)',
    'end'
  )
}

function reset() {
  getAllBlocks().forEach(el => {
    if (!el) return

    el.style.transition = 'none'
    el.style.transform = 'scaleY(0)'
    el.style.visibility = 'hidden'
  })
}

defineExpose({
  enter,
  leave,
  reset
})
</script>

<style scoped>
.block {
  transform: scaleY(0);
  will-change: transform;
}
</style>
