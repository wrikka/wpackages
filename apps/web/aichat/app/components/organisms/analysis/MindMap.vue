<script setup lang="ts">

import { computed } from 'vue';
import MindMapNode from '~/components/MindMapNode.vue';

interface Node {
  id: string;
  parentId: string | null;
  label: string;
  children?: Node[];
}
interface MindMapSummaryData {
  type: 'mind_map_summary';
  topic: string;
  nodes: Node[];
}
const props = defineProps<{ 
  summary: MindMapSummaryData 
}>();
// Computed property to transform flat list of nodes into a tree structure
const tree = computed(() => {
  const nodes = JSON.parse(JSON.stringify(props.summary.nodes));
  const nodeMap: { [key: string]: Node } = {};
  // First, map all nodes by their ID
  nodes.forEach((node: Node) => {
    node.children = [];
    nodeMap[node.id] = node;
  });
  const treeData: Node[] = [];
  // Then, build the tree structure
  nodes.forEach((node: Node) => {
    if (node.parentId) {
      const parent = nodeMap[node.parentId];
      if (parent) {
        parent.children?.push(node);
      }
    } else {
      // This is a root node
      treeData.push(node);
    }
  });
  return treeData;
});

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Mind Map: {{ summary.topic }}</h3>
    <ul class="space-y-2">
      <MindMapNode v-for="node in tree" :key="node.id" :node="node" />
    </ul>
  </div>

</template>