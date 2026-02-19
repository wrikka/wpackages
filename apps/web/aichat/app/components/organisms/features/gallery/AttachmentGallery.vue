<script setup lang="ts">

import type { GalleryItem, GalleryPreview } from '~/shared/types/attachmentGallery'

const props = defineProps<{
  items: GalleryItem[]
  selectedIds: string[]
  viewMode: 'grid' | 'list' | 'timeline'
}>()
const emit = defineEmits<{
  select: [itemId: string]
  selectMultiple: [itemIds: string[]]
  preview: [item: GalleryItem]
  download: [itemId: string]
  delete: [itemId: string]
}>()
const isOpen = ref(false)
const searchQuery = ref('')
const filterType = ref<string | null>(null)
const sortBy = ref<'date' | 'name' | 'type' | 'size'>('date')
const filteredItems = computed(() => {
  let result = [...props.items]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(i => i.name.toLowerCase().includes(query))
  }
  if (filterType.value) {
    result = result.filter(i => i.type.startsWith(filterType.value!))
  }
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date': return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      case 'name': return a.name.localeCompare(b.name)
      case 'type': return a.type.localeCompare(b.type)
      case 'size': return b.size - a.size
      default: return 0
    }
  })
  return result
})
const fileTypes = computed(() => {
  const types = new Set(props.items.map(i => i.type.split('/')[0]))
  return Array.from(types)
})
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
function isImage(type: string): boolean {
  return type.startsWith('image/')
}

</script>

<template>

  <div>
    <button class="btn-icon" title="Attachment Gallery" @click="isOpen = true">
      <span class="i-carbon-attachment"></span>
      <span v-if="items.length > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
        {{ items.length }}
      </span>
    </button>
    
    <UModal v-model="isOpen" :ui="{ width: 'max-w-4xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Attachments ({{ items.length }})</h3>
            <div class="flex items-center gap-2">
              <button
                v-for="mode in ['grid', 'list']"
                :key="mode"
                class="btn-icon text-xs"
                :class="viewMode === mode ? 'text-primary-500' : ''"
                @click="$emit('update:viewMode', mode)"
              >
                <span :class="mode === 'grid' ? 'i-carbon-grid' : 'i-carbon-list'"></span>
              </button>
            </div>
          </div>
        
</template>