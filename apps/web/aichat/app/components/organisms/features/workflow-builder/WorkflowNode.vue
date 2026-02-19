<script setup lang="ts">

import { ref } from 'vue';
import type { WorkflowNode } from '~/shared/types/workflow';

const props = defineProps<{ node: WorkflowNode }>();
// In a real app, useDraggable from VueUse would be ideal here
const position = ref(props.node.position);
const nodeStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
}));

</script>

<template>

  <div 
    class="absolute p-4 bg-gray-700 rounded-lg shadow-md w-48 cursor-move border-2 border-transparent hover:border-blue-500"
    :style="nodeStyle"
  >
    <div class="font-bold mb-2">{{ node.type }}</div>
    <div class="text-xs text-gray-300">
      <!-- Placeholder for node content/settings -->
      <p>ID: {{ node.id }}</p>
    </div>
    <!-- Connection handles -->
    <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-900"></div>
    <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-900"></div>
  </div>

</template>