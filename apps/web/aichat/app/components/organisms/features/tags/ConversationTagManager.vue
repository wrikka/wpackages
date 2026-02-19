<script setup lang="ts">


const props = defineProps<{
  conversationId: string
}>()
const tagsStore = useTagsStore()
const showPopover = ref(false)
const showCreateTag = ref(false)
const newTagName = ref('')
const selectedColor = ref('#3b82f6')
const tagColors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
]
const displayTags = computed(() => {
  return tagsStore.getConversationTags(props.conversationId)
})
const toggleTag = async (tagId: string) => {
  await tagsStore.toggleTagOnConversation(props.conversationId, tagId)
}
const createTag = async () => {
  await tagsStore.createTag({
    name: newTagName.value.trim(),
    color: selectedColor.value,
  })
  newTagName.value = ''
  showCreateTag.value = false
}
onMounted(() => {
  tagsStore.fetchTags()
})

</script>

<template>

  <div class="tag-manager">
    <div class="relative inline-block">
      <Button
        size="xs"
        variant="secondary"
        @click="showPopover = !showPopover"
      >
        <Icon name="lucide:tag" class="w-4 h-4 mr-1" />
        {{ displayTags.length ? displayTags.length.toString() : 'Tag' }}
      </Button>
      
      <div
        v-if="showPopover"
        class="absolute z-10 mt-1 p-4 space-y-3 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Tags</span>
          <Button
            size="xs"
            variant="primary"
            @click="showCreateTag = true"
          >
            <Icon name="plus" size="sm" />
          </Button>
        </div>
        
        <TagSelector
          :tags="tagsStore.tags"
          :applied-tags="displayTags"
          @toggle="toggleTag"
        />
      </div>
    </div>
    
    <Modal v-model="showCreateTag" width="sm">
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">Create New Tag</h3>
        
</template>