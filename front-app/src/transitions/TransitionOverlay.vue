<template>
  <component
    :is="currentTransitionComponent"
    ref="overlayRef"
    :color="transitionColor"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouteTransition } from './useRouteTransition'

const {
  activeOverlay,
  transitionColor,
  currentTransitionComponent
} = useRouteTransition()

const overlayRef = ref<any>(null)

watch(overlayRef, (val) => {
  activeOverlay.value = val
})
</script>
