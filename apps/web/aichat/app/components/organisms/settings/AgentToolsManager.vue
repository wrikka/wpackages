<script setup lang="ts">

import type { Tool } from '#shared/types/chat';

const props = defineProps<{ 
  agentId: string;
}>();

const availableTools = ref<Tool[]>([]);
const agentTools = ref<Tool[]>([]);
const selectedToolId = ref('');

async function fetchAvailableTools() {
  availableTools.value = await $fetch('/api/tools');
}

async function fetchAgentTools() {
  agentTools.value = await $fetch(`/api/agents/${props.agentId}/tools`);
}

async function addTool() {
  if (!selectedToolId.value) return;

  await $fetch(`/api/agents/${props.agentId}/tools`, {
    method: 'POST',
    body: { toolId: selectedToolId.value },
  });
  selectedToolId.value = '';
  await fetchAgentTools();
}

async function removeTool(toolId: string) {
  await $fetch(`/api/agents/${props.agentId}/tools/${toolId}`, {
    method: 'DELETE',
  });
  await fetchAgentTools();
}

onMounted(() => {
  fetchAvailableTools();
  fetchAgentTools();
});

const unassignedTools = computed(() => {
  const assignedIds = new Set(agentTools.value.map(t => t.id));
  return availableTools.value.filter(t => !assignedIds.has(t.id));
});

</script>

<template>

  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Manage Tools</h3>
    
    <!-- Add Tool Form -->
    <div class="flex items-center gap-2 p-4 border rounded-lg">
      <USelect v-model="selectedToolId" :options="unassignedTools" option-attribute="name" value-attribute="id" class="flex-1" />
      <UButton @click="addTool" :disabled="!selectedToolId">Add Tool</UButton>
    </div>

    <!-- Assigned Tools List -->
    <div v-if="agentTools.length > 0" class="space-y-2">
      <UCard v-for="tool in agentTools" :key="tool.id">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold">{{ tool.name }}</p>
            <p class="text-sm text-gray-500">{{ tool.description }}</p>
          </div>
          <UButton color="red" variant="ghost" icon="i-carbon-trash-can" @click="removeTool(tool.id)" />
        </div>
      </UCard>
    </div>
    <div v-else class="text-sm text-gray-500">No tools assigned to this agent.</div>
  </div>

</template>