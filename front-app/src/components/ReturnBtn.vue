<template>
  <VButton @click="router.push({ name: routeName })">
    Retour
  </VButton>

</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import VButton from '@/components/VButton.vue'

const router = useRouter()

withDefaults(defineProps<{
  routeName: string
}>(), {
  routeName: 'home'
})

</script>
