<template>
  <button
    type="button"
    class="btn border-none"
    :class="[
      fullWidth ? 'w-full' : '',
      color,
      textColor,
      size
    ]"
    :aria-label="ariaLabel"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  ariaLabel: { type: String, required: false },
  color:     { type: String, default: 'bg-white' },
  textColor: { type: String, default: 'text-black' },
  size:      { type: String, default: '' },
  fullWidth: { type: Boolean, default: false }
});
</script>
