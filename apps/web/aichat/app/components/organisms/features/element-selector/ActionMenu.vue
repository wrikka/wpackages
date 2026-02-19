<script setup lang="ts">

import { computed } from 'vue';
import { useElementSelectorStore } from '~/stores/elementSelectorStore';

const store = useElementSelectorStore();
const menuStyle = computed(() => {
  if (!store.selectedElement) return {};
  const { x, y, height } = store.selectedElement.bounds;
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y + height + 8}px`,
  };
});
const suggestedActions = computed(() => {
  if (!store.selectedElement) return [];
  // TODO: Get actions from a more intelligent source
  switch (store.selectedElement.elementType) {
    case 'Button': return ['Click', 'Get Text', 'Wait for this to disappear'];
    case 'TextField': return ['Type into', 'Get Value', 'Clear'];
    case 'Table': return ['Extract data', 'Copy as CSV'];
    default: return ['Click', 'Get Text', 'Copy Screenshot'];
  }
});
const handleAction = (action: string) => {
  console.log(`Performing action: ${action} on element:`, store.selectedElement?.id);
  store.deactivate();
};

</script>

<template>

  <div v-if="store.selectedElement" :style="menuStyle" class="bg-gray-900 text-white rounded-lg shadow-xl p-2 z-50">
    <div class="text-xs text-gray-400 px-2 pb-2 border-b border-gray-700">Element: {{ store.selectedElement.elementType }}</div>
    <ul>
      <li 
        v-for="action in suggestedActions"
        :key="action"
        @click="handleAction(action)"
        class="px-2 py-1.5 hover:bg-blue-600 rounded-md cursor-pointer text-sm"
      >
        {{ action }}
      </li>
    </ul>
  </div>

</template>