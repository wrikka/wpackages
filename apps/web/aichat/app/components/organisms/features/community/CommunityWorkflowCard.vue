<script setup lang="ts">

import type { CommunityWorkflow } from '~/shared/types/community';

const props = defineProps<{ workflow: CommunityWorkflow }>();

</script>

<template>

  <NuxtLink :to="`/community/${workflow.id}`" class="block bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
    <h3 class="text-xl font-bold mb-2">{{ workflow.name }}</h3>
    <p class="text-sm text-gray-400 mb-4 h-10 overflow-hidden">{{ workflow.description }}</p>
    <div class="flex justify-between items-center text-xs text-gray-400">
      <span>by {{ workflow.author }}</span>
      <div class="flex space-x-4">
        <span>Downloads: {{ workflow.downloads }}</span>
        <span>Rating: {{ workflow.rating }}/5</span>
      </div>
    </div>
  </NuxtLink>

</template>