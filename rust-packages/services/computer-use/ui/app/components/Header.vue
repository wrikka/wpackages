<script setup>

import { ref, defineEmits } from 'vue'

const sandboxMode = ref(true)

defineEmits(['request-help'])

</script>

<template>

  <header class="pb-4 border-b flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold">AI Computer Use</h1>
      <p class="text-gray-500">Desktop Automation Control Panel</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium">Sandbox Mode</span>
      <UToggle v-model="sandboxMode" />
      <UButton variant="outline" @click="$emit('request-help')">Simulate Help Request</UButton>
    </div>
  </header>

</template>