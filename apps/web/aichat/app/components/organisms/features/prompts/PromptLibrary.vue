<script setup lang="ts">

import type { PromptTemplate, PromptCategory } from '~/shared/types/promptLibrary'

const props = defineProps<{
  templates: PromptTemplate[]
  categories: PromptCategory[]
}>()
const emit = defineEmits<{
  select: [template: PromptTemplate]
  copy: [content: string]
  filterByCategory: [categoryId: string]
}>()
const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const filteredTemplates = computed(() => {
  let result = props.templates
  if (selectedCategory.value) {
    result = result.filter(t => t.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  return result.sort((a, b) => b.usageCount - a.usageCount)
})

</script>

<template>

  <div class="prompt-library h-full flex flex-col">
    <div class="library-header p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3 mb-3">
        <h3 class="font-semibold">Prompt Library</h3>
        <div class="flex-1"></div>
        <button
          class="btn-icon"
          :class="viewMode === 'grid' ? 'text-primary-500' : ''"
          @click="viewMode = 'grid'"
        >
          <span class="i-carbon-grid"></span>
        </button>
        <button
          class="btn-icon"
          :class="viewMode === 'list' ? 'text-primary-500' : ''"
          @click="viewMode = 'list'"
        >
          <span class="i-carbon-list"></span>
        </button>
      </div>
      
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search prompts..."
        class="input w-full mb-3"
      >
      
      <div class="flex flex-wrap gap-2">
        <button
          class="badge cursor-pointer"
          :class="!selectedCategory ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'"
          @click="selectedCategory = null"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          class="badge cursor-pointer flex items-center gap-1"
          :class="selectedCategory === category.id ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'"
          @click="selectedCategory = category.id"
        >
          <span :class="category.icon"></span>
          {{ category.name }}
        </button>
      </div>
    </div>
    
    <div
      class="library-content flex-1 overflow-y-auto p-4"
      :class="viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-2'"
    >
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="prompt-card border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        :class="viewMode === 'list' ? 'flex items-center gap-3 p-3' : 'flex flex-col'"
        @click="emit('select', template)"
      >
        <div v-if="viewMode === 'grid'" class="p-3 flex-1">
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-medium text-sm line-clamp-1">{{ template.title }}</h4>
            <button
              class="btn-icon text-xs opacity-0 group-hover:opacity-100"
              @click.stop="emit('copy', template.content)"
            >
              <span class="i-carbon-copy"></span>
            </button>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ template.description }}</p>
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <span class="i-carbon-star-filled text-yellow-500"></span>
            {{ template.rating.toFixed(1) }}
            <span class="mx-1">|</span>
            <span class="i-carbon-usage"></span>
            {{ template.usageCount }}
          </div>
        </div>
        
        <template v-else>
          <span :class="categories.find(c => c.id === template.category)?.icon || 'i-carbon-prompt'"></span>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm">{{ template.title }}</h4>
            <p class="text-xs text-gray-500 truncate">{{ template.description }}</p>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <span class="i-carbon-star-filled text-yellow-500"></span>
            {{ template.rating.toFixed(1) }}
          </div>
        
</template>