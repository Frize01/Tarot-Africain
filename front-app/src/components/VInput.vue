<script setup lang="ts">
const model = defineModel<string>()

withDefaults(defineProps<{
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  autocomplete?: string
  required?: boolean
}>(), {
  type: 'text'
})

defineSlots<{ content?: () => any }>()
</script>

<template>
  <label
    class="input input-bordered flex items-center gap-2 bg-transparent border-black focus-within:border-black focus-within:outline-none"
  >
    <slot name="content" />
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      class="grow bg-transparent"
    />
  </label>
</template>
