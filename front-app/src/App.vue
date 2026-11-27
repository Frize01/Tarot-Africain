<script setup lang="ts">
import TransitionOverlay from '@/transitions/TransitionOverlay.vue'
import GuestIdentityModal from '@/components/GuestIdentityModal.vue'
</script>

<template>
  <TransitionOverlay />

  <RouterView />

  <GuestIdentityModal />
</template>
