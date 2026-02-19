<script setup lang="ts">

import type { Activity } from '~/shared/types/analytics';

defineProps<{ activities: Activity[] }>();

</script>

<template>

  <ul class="space-y-4">
    <li v-for="activity in activities" :key="activity.id" class="flex items-center">
      <!-- Icon placeholder -->
      <div class="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
      <div>
        <p class="text-sm">{{ activity.description }}</p>
        <p class="text-xs text-gray-500">{{ activity.timestamp }}</p>
      </div>
    </li>
  </ul>

</template>