<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import mermaid from 'mermaid';

const props = defineProps<{ code: string }>();
const mermaidContainer = ref<HTMLDivElement | null>(null);
const svg = ref('');
const renderMermaid = async () => {
  if (mermaidContainer.value && props.code) {
    try {
      const { svg: renderedSvg } = await mermaid.render('mermaid-graph', props.code);
      svg.value = renderedSvg;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      svg.value = '<p class="text-red-500">Error rendering diagram.</p>';
    }
  }
};
onMounted(() => {
  renderMermaid();
});
watch(() => props.code, () => {
  renderMermaid();
});

</script>

<template>

  <div ref="mermaidContainer" v-html="svg"></div>

</template>