<script setup lang="ts">

import type { ConversationTemplate, TemplateApplication } from '~/shared/types/template'

const props = defineProps<{
  templates: ConversationTemplate[]
}>()
const emit = defineEmits<{
  select: [template: ConversationTemplate]
  apply: [application: TemplateApplication]
}>()
const selectedTemplate = ref<ConversationTemplate | null>(null)
const filledSteps = ref<Record<string, string>>({})
const isApplying = ref(false)
const categories = computed(() => {
  const cats = new Set(props.templates.map(t => t.category))
  return Array.from(cats)
})
const filteredTemplates = computed(() => {
  if (!selectedCategory.value) return props.templates
  return props.templates.filter(t => t.category === selectedCategory.value)
})
const selectedCategory = ref<string | null>(null)
function startApply(template: ConversationTemplate) {
  selectedTemplate.value = template
  filledSteps.value = {}
  template.structure.forEach(step => {
    filledSteps.value[step.id] = step.content
  })
  isApplying.value = true
}
function confirmApply() {
  if (!selectedTemplate.value) return
  emit('apply', {
    templateId: selectedTemplate.value.id,
    filledSteps: Object.entries(filledSteps.value).map(([stepId, content]) => ({
      stepId,
      content,
    })),
  })
  isApplying.value = false
  selectedTemplate.value = null
}

</script>

<template>

  <div class="template-gallery">
    <div class="gallery-header p-4 border-b">
      <h3 class="font-semibold mb-3">Conversation Templates</h3>
      <div class="flex flex-wrap gap-2">
        <button
          class="badge cursor-pointer"
          :class="!selectedCategory ? 'bg-primary-100' : 'bg-gray-100'"
          @click="selectedCategory = null"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="badge cursor-pointer capitalize"
          :class="selectedCategory === cat ? 'bg-primary-100' : 'bg-gray-100'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-3 p-4">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md cursor-pointer"
        @click="startApply(template)"
      >
        <div class="flex items-center gap-2 mb-2">
          <span :class="template.icon" class="text-lg"></span>
          <h4 class="font-medium text-sm">{{ template.name }}</h4>
        </div>
        <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ template.description }}</p>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span class="i-carbon-list-numbered"></span>
          {{ template.structure.length }} steps
          <span class="mx-1">|</span>
          <span class="i-carbon-usage"></span>
          {{ template.usageCount }}
        </div>
      </div>
    </div>
    
    <UModal v-model="isApplying" :ui="{ width: 'max-w-lg' }">
      <UCard v-if="selectedTemplate">
        <template #header>
          <h3 class="font-semibold">{{ selectedTemplate.name }}</h3>
          <p class="text-sm text-gray-500">{{ selectedTemplate.description }}</p>
        
</template>