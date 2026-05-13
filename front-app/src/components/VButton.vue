<template>
  <button
    type="button"
    class="btn flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 border-none"
    :class="[
      size,
      { 'w-full': fullWidth }
    ]"
    :aria-label="ariaLabel"
  >
    <slot name="icon"></slot>

    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  ariaLabel?: string
  size?: string      // btn-sm, btn-lg
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  size: '',
  fullWidth: false
})

defineSlots<{
  icon?: () => any
  default?: () => any
}>()
</script>
