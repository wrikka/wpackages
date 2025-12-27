<script setup lang="ts">

const { viteConfig, isConnected } = useViteServer();
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Vite Config</h2>
    <div v-if="!isConnected">
      <p class="text-yellow-400">Connecting to Vite server...</p>
    </div>
    <div v-else-if="viteConfig">
      <JsonTreeView :data="viteConfig" :root="true" />
    </div>
    <p v-else>Waiting for Vite config...</p>
  </div>
</template>
