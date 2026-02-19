<script setup lang="ts">

import { ref } from 'vue';

const searchTerm = ref('');
const category = ref('all');
const handleSearch = () => {
  console.log(`Searching for: ${searchTerm.value} in category: ${category.value}`);
  // In a real app, this would emit an event to the parent to filter the list
};

</script>

<template>

  <div class="flex space-x-4">
    <input 
      v-model="searchTerm"
      type="text"
      placeholder="Search workflows..."
      class="flex-grow bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <select v-model="category" class="bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="all">All Categories</option>
      <option value="productivity">Productivity</option>
      <option value="development">Development</option>
      <option value="social">Social Media</option>
    </select>
    <button @click="handleSearch" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">Search</button>
  </div>

</template>