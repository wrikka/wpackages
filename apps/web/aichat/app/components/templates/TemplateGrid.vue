<script setup lang="ts">


interface Template {
  id: string
  name: string
  description?: string
  category: string
  icon?: string
  isPublic?: boolean
  usageCount?: number
}
defineProps<{
  templates: Template[]
}>()
defineEmits<{
  select: [template: Template]
}>()

</script>

<template>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
    <TemplateCard
      v-for="template in templates"
      :key="template.id"
      :template="template"
      @select="$emit('select', $event)"
    />
  </div>

</template>