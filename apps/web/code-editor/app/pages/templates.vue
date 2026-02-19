<script setup>

const { data: templates, pending, error } = await useFetch('/api/templates')

function selectTemplate(template) {
  // In a real application, this would trigger a process to create a new project.
  alert(`Creating project from template: ${template.name}`)
}

</script>

<template>

  <div>
    <h1 class="text-3xl font-bold mb-6">Project Templates</h1>
    <div v-if="pending" class="text-center">
      <p>Loading templates...</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      <p>Failed to load templates: {{ error.message }}</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="template in templates" 
        :key="template.id" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        @click="selectTemplate(template)"
      >
        <div class="flex items-center mb-4">
          <!-- Assuming you have an icon component or will use an img tag -->
          <!-- <Icon :name="template.icon" class="w-10 h-10 mr-4" /> -->
          <div class="w-10 h-10 mr-4 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center font-bold text-xl">{{ template.name.charAt(0) }}</div>
          <h2 class="text-xl font-bold">{{ template.name }}</h2>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ template.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in template.tags" 
            :key="tag"
            class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>

</template>