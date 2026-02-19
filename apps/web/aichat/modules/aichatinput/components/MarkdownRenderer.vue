<script setup lang="ts">

import { marked } from 'marked';
import { ref, computed } from 'vue';

const props = defineProps<{ content: string }>();
interface ContentChunk {
  type: 'html' | 'code' | 'mermaid';
  content: string;
  lang?: string;
}
const chunks = computed((): ContentChunk[] => {
  const tokens = marked.lexer(props.content);
  const result: ContentChunk[] = [];
  for (const token of tokens) {
    if (token.type === 'code' && token.lang === 'mermaid') {
      result.push({ type: 'mermaid', content: token.text });
    } else if (token.type === 'code') {
      result.push({ type: 'code', content: token.text, lang: token.lang });
    } else {
      // For non-code blocks, we render them back to HTML.
      // This is a simplification; a more robust solution might handle other token types.
      const htmlContent = marked.parser([token]);
      const lastChunk = result[result.length - 1];
      if (lastChunk && lastChunk.type === 'html') {
        lastChunk.content += htmlContent;
      } else {
        result.push({ type: 'html', content: htmlContent });
      }
    }
  }
  return result;
});

</script>

<template>

  <div class="prose dark:prose-invert max-w-none">
    <template v-for="(chunk, index) in chunks" :key="index">
      <div v-if="chunk.type === 'html'" v-html="chunk.content"></div>
            <CodeBlock
        v-else-if="chunk.type === 'code'"
        :snippet-id="`code-${index}`"
        :language="chunk.lang || 'plaintext'"
        :original-code="chunk.content"
        :refactored-code="chunk.content" 
        explanation=""
      />
      <Mermaid v-else-if="chunk.type === 'mermaid'" :code="chunk.content" />
    
</template>