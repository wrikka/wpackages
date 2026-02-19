<script setup lang="ts">


defineProps<{
  icon: string
  message: string
  keys?: any[]
}>()

</script>

<template>

  <div v-if="keys.length === 0" class="text-center py-8 text-gray-500">
    <Icon :name="icon" class="w-12 h-12 mx-auto mb-2 opacity-50" />
    <p>{{ message }}</p>
  </div>

</template>