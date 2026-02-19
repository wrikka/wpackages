<script setup lang="ts">


const isOpen = defineModel<boolean>('isOpen');
const generationType = ref('blog-post');
const topic = ref('');
const generatedContent = ref('');
const isLoading = ref(false);
const generationTypes = [
  { key: 'blog-post', label: 'Blog Post Writer' },
  { key: 'social-media-post', label: 'Social Media Post Generator' },
];
async function generateContent() {
  if (!topic.value) return;
  isLoading.value = true;
  generatedContent.value = '';
  try {
    const result = await $fetch(`/api/generate/${generationType.value}`, {
      method: 'POST',
      body: { topic: topic.value },
    });
    generatedContent.value = result.content;
  } catch (error) {
    console.error('Failed to generate content:', error);
    generatedContent.value = 'Sorry, something went wrong. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
function closeModal() {
  isOpen.value = false;
  // Reset state when closing
  setTimeout(() => {
    topic.value = '';
    generatedContent.value = '';
  }, 300); // Wait for modal transition
}

</script>

<template>

  <UModal v-model="isOpen" @close="closeModal">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">AI Content Generation</h2>
      
</template>