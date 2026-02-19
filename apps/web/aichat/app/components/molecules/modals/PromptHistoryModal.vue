<script setup lang="ts">

import type { AgentPromptHistory } from '#shared/types/agent';

const props = defineProps<{ 
  modelValue: boolean;
  agentId: string;
}>();
const emit = defineEmits(['update:modelValue', 'restore']);
const history = ref<AgentPromptHistory[]>([]);
async function fetchHistory() {
  if (props.agentId) {
    history.value = await $fetch(`/api/agents/${props.agentId}/history`);
  }
}
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    fetchHistory();
  }
});
function restorePrompt(prompt: string) {
  emit('restore', prompt);
  emit('update:modelValue', false);
}

</script>

<template>
  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Prompt History</h3>
      </template>
      
      <div class="space-y-2">
        <div v-for="item in history" :key="item.id" class="p-3 border rounded">
          <div class="text-sm text-gray-500">{{ new Date(item.createdAt).toLocaleString() }}</div>
          <div class="mt-1">{{ item.systemPrompt }}</div>
          <UButton 
            @click="restorePrompt(item.systemPrompt || '')"
            size="sm" 
            variant="outline"
            class="mt-2"
          >
            Restore
          </UButton>
        </div>
        <div v-if="history.length === 0" class="text-center text-gray-500 py-4">
          No history found
        </div>
      </div>
    </UCard>
  </UModal>
</template>