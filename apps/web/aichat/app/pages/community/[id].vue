<script setup lang="ts">

import { useCommunityStore } from '~/stores/communityStore';
import type { CommunityWorkflow } from '~/shared/types/community';

const route = useRoute();
const store = useCommunityStore();
const workflow = ref<CommunityWorkflow | null>(null);

onMounted(async () => {
  const workflowId = route.params.id as string;
  workflow.value = await store.fetchWorkflowById(workflowId);
});

const handleImport = () => {
  if (!workflow.value) return;
  console.log(`Importing workflow: ${workflow.value.name}`);
  // TODO: Add to user's local workflows
};

</script>

<template>

  <div class="bg-gray-900 text-white min-h-screen p-8">
    <div v-if="!workflow" class="text-center">Loading...</div>
    <div v-else class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-2">{{ workflow.name }}</h1>
      <p class="text-gray-400 mb-4">by {{ workflow.author }}</p>
      
      <div class="flex space-x-4 text-sm text-gray-400 mb-6">
        <span>Downloads: {{ workflow.downloads }}</span>
        <span>Rating: {{ workflow.rating }}/5</span>
        <span>Version: {{ workflow.version }}</span>
      </div>

      <div class="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 class="text-2xl font-semibold mb-3">Description</h2>
        <p>{{ workflow.description }}</p>
      </div>

      <div class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold mb-3">Actions ({{ workflow.actions.length }})</h2>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(action, index) in workflow.actions" :key="index">{{ action.type }}</li>
        </ul>
      </div>

      <div class="mt-8 text-center">
        <button @click="handleImport" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg">
          Import to My Workflows
        </button>
      </div>
    </div>
  </div>

</template>