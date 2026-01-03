<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';

const readmeContent = ref('');
const md = new MarkdownIt();

// Placeholder for fetching README content
const fetchReadme = async () => {
  const markdown = `# @wpackages/program\n\nThis is a sample README file.\n\n- Feature 1\n- Feature 2\n`;
  readmeContent.value = md.render(markdown);
};

onMounted(() => {
  fetchReadme();
});
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">README Preview</h1>
    <div class="prose dark:prose-invert max-w-none" v-html="readmeContent"></div>
  </div>
</template>

<style>
.prose {
  /* Add some basic prose styling if not covered by UnoCSS reset */
}
</style>
