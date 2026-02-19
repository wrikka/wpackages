<script setup>

// No script needed for this simple component

</script>

<template>

  <nav class="flex flex-col gap-2">
    <NuxtLink to="/dashboard" class="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</NuxtLink>
    <NuxtLink to="/workflows" class="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Workflows</NuxtLink>
    <NuxtLink to="/analytics" class="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Analytics</NuxtLink>
  </nav>

</template>