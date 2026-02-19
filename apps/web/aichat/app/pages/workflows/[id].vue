<script setup lang="ts">

import ActionPalette from '~/components/workflow-builder/ActionPalette.vue';
import WorkflowCanvas from '~/components/workflow-builder/WorkflowCanvas.vue';
import { useWorkflowStore } from '~/stores/workflowStore';

const route = useRoute();
const store = useWorkflowStore();

// Load workflow based on ID from route
onMounted(() => {
  store.loadWorkflow(route.params.id as string);
});

const workflowName = computed(() => store.currentWorkflow?.name || 'Untitled Workflow');

</script>

<template>

  <div class="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
    <header class="flex-shrink-0 bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
      <h1 class="text-lg font-bold">{{ workflowName }}</h1>
      <div>
        <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">Save</button>
      </div>
    </header>
    <div class="flex flex-grow">
      <ActionPalette />
      <main class="flex-grow relative">
        <WorkflowCanvas />
      </main>
    </div>
  </div>

</template>