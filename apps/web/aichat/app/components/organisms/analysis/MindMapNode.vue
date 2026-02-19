<script setup lang="ts">

import { ref, computed } from 'vue';

// Define the component's name for recursion
const MindMapNode = 'MindMapNode';
interface Node {
  id: string;
  parentId: string | null;
  label: string;
  children?: Node[];
}
const props = defineProps<{ 
  node: Node 
}>();
const isOpen = ref(true);
const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
const toggle = () => {
  isOpen.value = !isOpen.value;
};

</script>

<template>

  <li>
    <div class="flex items-center">
      <button v-if="hasChildren" @click="toggle" class="mr-2 text-gray-500 hover:text-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-90': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="w-4 mr-2"></div>
      <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">{{ node.label }}</span>
    </div>
    <ul v-if="hasChildren && isOpen" class="pl-8 mt-2 space-y-2 border-l border-gray-200">
      <MindMapNode v-for="child in node.children" :key="child.id" :node="child" />
    </ul>
  </li>

</template>