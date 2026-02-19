<script setup lang="ts">

const orgStore = useOrganizationStore()

onMounted(() => {
  orgStore.fetchOrganizations()
})

useHead({
  title: 'AI Chatbot',
})

</script>

<template>

  <div class="min-h-screen bg-gray-100">
    <slot />
  </div>

</template>