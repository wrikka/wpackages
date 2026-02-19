<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
})

</script>

<template>

  <ChatScreen :initial-mode="'writer'" />

</template>