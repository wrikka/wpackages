<script setup lang="ts">

import { useWorkflowStore } from '~/stores/workflowStore';
import WorkflowNode from './WorkflowNode.vue';

const store = useWorkflowStore();
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    if (data.type === 'new-node') {
      store.addNode({
        type: data.actionType,
        position: { x: event.clientX - 256, y: event.clientY - 60 }, // Adjust for palette and header width
      });
    }
  }
};
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
};

</script>

<template>

  <div 
    class="w-full h-full bg-gray-900 relative overflow-hidden"
    @drop="handleDrop"
    @dragover="handleDragOver"
  >
    <!-- Render nodes -->
    <WorkflowNode 
      v-for="node in store.currentWorkflow?.nodes"
      :key="node.id"
      :node="node"
    />
    
    <!-- Render edges (SVG) -->
    <svg class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>
      <!-- TODO: Logic to calculate and draw lines between nodes -->
    </svg>
  </div>

</template>