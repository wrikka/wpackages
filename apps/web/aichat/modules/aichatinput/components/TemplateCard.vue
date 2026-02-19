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
  template: Template
}>()
defineEmits<{
  select: [template: Template]
}>()

</script>

<template>

  <div
    class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
    @click="$emit('select', template)"
  >
    <div class="flex items-start gap-3">
      <Icon name="lucide:puzzle" class="w-8 h-8 text-blue-500" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h4 class="font-medium truncate">{{ template.name }}</h4>
          <Badge v-if="template.isPublic" variant="success" size="xs">Public</Badge>
        </div>
        <p class="text-sm text-gray-500 line-clamp-2">{{ template.description }}</p>
        <div class="flex items-center gap-2 mt-2">
          <Badge variant="gray" size="xs">{{ template.category }}</Badge>
          <span class="text-xs text-gray-400">{{ template.usageCount }} uses</span>
        </div>
      </div>
    </div>
  </div>

</template>