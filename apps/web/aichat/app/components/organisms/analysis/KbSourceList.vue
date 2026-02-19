<script setup lang="ts">

import type { KnowledgeBaseSource } from '#shared/types/chat';
import { useKbSources } from '~/composables/chat/useKbSources';

const props = defineProps<{ 
  kbId: string;
}>();
// Use knowledge base sources composable
const {
  sources,
  isLoading,
  newSourceType,
  newSourceUri,
  fetchSources,
  addSource,
  deleteSource,
} = useKbSources(props.kbId)
onMounted(fetchSources)

</script>

<template>

  <div class="space-y-4">
    <!-- Add Source Form -->
    <div class="p-4 border rounded-lg">
      <h3 class="font-semibold mb-2">Add New Source</h3>
      <div class="flex items-center gap-2">
        <USelect v-model="newSourceType" :options="['url', 'file']" />
        <UInput v-if="newSourceType === 'url'" v-model="newSourceUri" placeholder="https://example.com" class="flex-1" />
        <UInput v-else type="file" class="flex-1" />
        <UButton @click="addSource">Add</UButton>
      </div>
    </div>

    <!-- Source List -->
    <div v-if="isLoading">Loading sources...</div>
    <div v-else-if="sources.length > 0" class="space-y-2">
      <UCard v-for="source in sources" :key="source.id">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span :class="source.type === 'url' ? 'i-carbon-link' : 'i-carbon-document'"></span>
            <span class="text-sm truncate">{{ source.uri }}</span>
          </div>
          <UButton color="red" variant="ghost" icon="i-carbon-trash-can" @click="deleteSource(source.id)" />
        </div>
      </UCard>
    </div>
    <div v-else class="text-sm text-gray-500">No sources added yet.</div>
  </div>

</template>