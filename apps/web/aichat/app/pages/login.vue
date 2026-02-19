<script setup lang="ts">

definePageMeta({
  layout: 'auth'
})

</script>

<template>

  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="p-8 bg-white rounded-lg shadow-md text-center">
      <h1 class="text-2xl font-bold mb-6">Login to AI Chat</h1>
      <a href="/api/login/github" class="btn-primary inline-flex items-center">
        <span class="i-carbon-logo-github mr-2"></span>
        Login with GitHub
      </a>
    </div>
  </div>

</template>