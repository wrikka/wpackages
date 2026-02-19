<script setup lang="ts">


const prompts = [
  'Explain quantum computing in simple terms',
  'What are the best places to visit in Japan?',
  'Write a short story about a robot who discovers music',
  'Generate a Python script to scrape a website',
];
const emit = defineEmits(['select']);
const selectPrompt = (prompt: string) => {
  emit('select', prompt);
};

</script>

<template>

  <div class="example-prompts">
    <h4>Or try one of these examples:</h4>
    <ul>
      <li v-for="prompt in prompts" :key="prompt" @click="selectPrompt(prompt)">
        {{ prompt }}
      </li>
    </ul>
  </div>

</template>

<style scoped>

.example-prompts {
  text-align: center;
  margin: 2rem 0;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

li {
  background-color: #f0f0f0;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

li:hover {
  background-color: #e0e0e0;
}

</style>