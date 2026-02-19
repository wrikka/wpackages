<script setup lang="ts">


interface Tag {
  id: string
  name: string
  color: string
}
defineProps<{
  tags: Tag[]
  appliedTags: Tag[]
}>()
defineEmits<{
  toggle: [tagId: string]
}>()
const isApplied = (tagId: string) => {
  return props.appliedTags.some(t => t.id === tagId)
}
const props = defineProps<{
  tags: Tag[]
  appliedTags: Tag[]
}>()

</script>

<template>

  <div v-if="tags.length" class="space-y-1">
    <div
      v-for="tag in tags"
      :key="tag.id"
      class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      @click="$emit('toggle', tag.id)"
    >
      <div
        class="w-3 h-3 rounded-full"
        :style="{ backgroundColor: tag.color }"
      />
      <span class="flex-1 text-sm">{{ tag.name }}</span>
      <Icon
          v-if="isApplied(tag.id)"
          name="lucide:check"
          class="w-4 h-4 text-blue-500"
        />
    </div>
  </div>
  <div v-else class="text-sm text-gray-500 text-center py-4">
    No tags created yet
  </div>

</template>