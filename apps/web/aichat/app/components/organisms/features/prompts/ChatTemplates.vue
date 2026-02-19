<script setup lang="ts">


interface Template {
  id: string
  name: string
  description: string
  content: string
  icon: string
  category: string
  preview: string
}
const searchQuery = ref('')
const selectedCategory = ref('all')
const showCreateTemplate = ref(false)
const newTemplate = ref({
  name: '',
  category: 'code',
  content: ''
})
const quickTemplates = ref<Template[]>([
  { id: '1', name: 'Explain Code', description: 'Get a detailed explanation of any code snippet', content: 'Please explain this code:\n\n```\n{{code}}\n```', icon: 'i-heroicons-code-bracket', category: 'code', preview: 'Explain code snippet' },
  { id: '2', name: 'Write Tests', description: 'Generate unit tests for your functions', content: 'Write unit tests for:\n\n```\n{{code}}\n```', icon: 'i-heroicons-beaker', category: 'code', preview: 'Generate test cases' },
  { id: '3', name: 'Debug Help', description: 'Debug an error with AI assistance', content: 'I\'m getting this error:\n{{error}}\n\nHere\'s my code:\n{{code}}', icon: 'i-heroicons-bug-ant', category: 'code', preview: 'Debug errors' },
  { id: '4', name: 'Refactor Code', description: 'Improve and clean up your code', content: 'Please refactor this code to be more clean and efficient:\n\n```\n{{code}}\n```', icon: 'i-heroicons-sparkles', category: 'code', preview: 'Refactor code' }
])
const categories = ref([
  { id: 'all', name: 'All', count: 24 },
  { id: 'code', name: 'Coding', count: 12 },
  { id: 'writing', name: 'Writing', count: 5 },
  { id: 'data', name: 'Data', count: 4 },
  { id: 'custom', name: 'Custom', count: 3 }
])
const categoryOptions = [
  { label: 'Coding', value: 'code' },
  { label: 'Writing', value: 'writing' },
  { label: 'Data', value: 'data' },
  { label: 'Custom', value: 'custom' }
]
const myTemplates = ref<Template[]>([
  { id: '5', name: 'API Design Review', description: 'Review API design patterns', content: 'Please review this API design:\n{{api}}', icon: 'i-heroicons-server', category: 'code', preview: 'API design review' },
  { id: '6', name: 'PR Description', description: 'Generate PR descriptions', content: 'Generate a PR description for:\n{{changes}}', icon: 'i-heroicons-document-text', category: 'code', preview: 'PR description' },
  { id: '7', name: 'Meeting Notes', description: 'Summarize meeting notes', content: 'Summarize these meeting notes:\n{{notes}}', icon: 'i-heroicons-clipboard', category: 'writing', preview: 'Meeting summary' }
])
const extractVariables = computed(() => {
  const matches = newTemplate.value.content.match(/\{\{(\w+)\}\}/g)
  return matches ? [...new Set(matches.map(m => m.slice(2, -2)))] : []
})
const filteredTemplates = computed(() => {
  let filtered = myTemplates.value
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(t => t.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query)
    )
  }
  return filtered
})
const useTemplate = (template: Template) => {
  // Apply template to chat
}
const editTemplate = (template: Template) => {
  newTemplate.value = { ...template, name: template.name, category: template.category, content: template.content }
  showCreateTemplate.value = true
}
const createTemplate = () => {
  if (!newTemplate.value.name.trim()) return
  myTemplates.value.push({
    id: Date.now().toString(),
    name: newTemplate.value.name,
    description: 'Custom template',
    content: newTemplate.value.content,
    icon: 'i-heroicons-document',
    category: newTemplate.value.category,
    preview: newTemplate.value.content.slice(0, 50) + '...'
  })
  newTemplate.value = { name: '', category: 'code', content: '' }
  showCreateTemplate.value = false
}

</script>

<template>

  <div class="templates-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-document-duplicate" class="text-primary" />
        Chat Templates
      </h3>
      <UButton size="xs" color="primary" variant="soft" icon="i-heroicons-plus" @click="showCreateTemplate = true">
        Create
      </UButton>
    </div>

    <div class="panel-content space-y-4">
      <!-- Search -->
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Search templates..." size="sm" />

      <!-- Quick Templates -->
      <div class="quick-templates">
        <p class="text-sm font-medium mb-2">Quick Start</p>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="template in quickTemplates"
            :key="template.id"
            class="template-card p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg cursor-pointer hover:shadow-md transition-all"
            @click="useTemplate(template)"
          >
            <div class="flex items-center gap-2 mb-1">
              <UIcon :name="template.icon" class="text-primary" />
              <span class="font-medium text-sm">{{ template.name }}</span>
            </div>
            <p class="text-xs text-gray-500 line-clamp-2">{{ template.description }}</p>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="categories-section">
        <p class="text-sm font-medium mb-2">Categories</p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="cat in categories"
            :key="cat.id"
            size="xs"
            :color="selectedCategory === cat.id ? 'primary' : 'gray'"
            variant="soft"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
            <span class="ml-1 text-xs opacity-70">({{ cat.count }})</span>
          </UButton>
        </div>
      </div>

      <!-- My Templates -->
      <div class="my-templates">
        <p class="text-sm font-medium mb-2">My Templates</p>
        <div class="space-y-2">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-item flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <UIcon :name="template.icon" class="text-gray-400" />
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ template.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ template.preview }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-play" @click="useTemplate(template)" />
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-pencil" @click="editTemplate(template)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Template Modal -->
    <UModal v-model="showCreateTemplate">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create Template</h3>
        
</template>

<style scoped>

.templates-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>