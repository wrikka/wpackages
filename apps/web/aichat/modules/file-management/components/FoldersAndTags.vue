<script setup lang="ts">


interface Folder {
  id: string
  name: string
  icon?: string
  color?: string
  count: number
}
interface Tag {
  id: string
  name: string
  color: string
  count: number
}
const selectedFolder = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const showCreateFolder = ref(false)
const showCreateTag = ref(false)
const newFolder = ref({
  name: '',
  icon: 'i-heroicons-folder',
  color: 'text-blue-500'
})
const newTag = ref({
  name: '',
  color: '#3b82f6'
})
const folders = ref<Folder[]>([
  { id: '1', name: 'All Chats', icon: 'i-heroicons-inbox', color: 'text-gray-500', count: 42 },
  { id: '2', name: 'Work', icon: 'i-heroicons-briefcase', color: 'text-blue-500', count: 15 },
  { id: '3', name: 'Personal', icon: 'i-heroicons-user', color: 'text-green-500', count: 12 },
  { id: '4', name: 'Projects', icon: 'i-heroicons-rocket', color: 'text-purple-500', count: 8 },
  { id: '5', name: 'Archived', icon: 'i-heroicons-archive-box', color: 'text-gray-400', count: 7 }
])
const tags = ref<Tag[]>([
  { id: '1', name: 'urgent', color: '#ef4444', count: 3 },
  { id: '2', name: 'coding', color: '#3b82f6', count: 12 },
  { id: '3', name: 'ideas', color: '#f59e0b', count: 8 },
  { id: '4', name: 'review', color: '#10b981', count: 5 },
  { id: '5', name: 'draft', color: '#6b7280', count: 14 }
])
const folderIcons = [
  { label: 'Folder', value: 'i-heroicons-folder' },
  { label: 'Briefcase', value: 'i-heroicons-briefcase' },
  { label: 'Star', value: 'i-heroicons-star' },
  { label: 'Rocket', value: 'i-heroicons-rocket' },
  { label: 'Heart', value: 'i-heroicons-heart' },
  { label: 'Code', value: 'i-heroicons-code-bracket' }
]
const folderColors = [
  { value: 'text-gray-500', class: 'bg-gray-500' },
  { value: 'text-red-500', class: 'bg-red-500' },
  { value: 'text-orange-500', class: 'bg-orange-500' },
  { value: 'text-yellow-500', class: 'bg-yellow-500' },
  { value: 'text-green-500', class: 'bg-green-500' },
  { value: 'text-blue-500', class: 'bg-blue-500' },
  { value: 'text-purple-500', class: 'bg-purple-500' }
]
const tagColors = [
  { value: '#ef4444' },
  { value: '#f97316' },
  { value: '#f59e0b' },
  { value: '#84cc16' },
  { value: '#10b981' },
  { value: '#06b6d4' },
  { value: '#3b82f6' },
  { value: '#8b5cf6' },
  { value: '#d946ef' },
  { value: '#6b7280' }
]
const hasActiveFilters = computed(() => selectedFolder.value !== null || selectedTags.value.length > 0)
const folderActions = (folder: Folder) => [
  [{
    label: 'Rename',
    icon: 'i-heroicons-pencil',
    click: () => renameFolder(folder)
  }, {
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: () => deleteFolder(folder.id)
  }]
]
const selectFolder = (id: string) => {
  selectedFolder.value = selectedFolder.value === id ? null : id
}
const toggleTag = (id: string) => {
  const index = selectedTags.value.indexOf(id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(id)
  }
}
const getFolderName = (id: string) => folders.value.find(f => f.id === id)?.name || ''
const getTagName = (id: string) => tags.value.find(t => t.id === id)?.name || ''
const clearFilters = () => {
  selectedFolder.value = null
  selectedTags.value = []
}
const createFolder = () => {
  if (!newFolder.value.name.trim()) return
  folders.value.push({
    id: Date.now().toString(),
    name: newFolder.value.name,
    icon: newFolder.value.icon,
    color: newFolder.value.color,
    count: 0
  })
  newFolder.value = { name: '', icon: 'i-heroicons-folder', color: 'text-blue-500' }
  showCreateFolder.value = false
}
const createTag = () => {
  if (!newTag.value.name.trim()) return
  tags.value.push({
    id: Date.now().toString(),
    name: newTag.value.name,
    color: newTag.value.color,
    count: 0
  })
  newTag.value = { name: '', color: '#3b82f6' }
  showCreateTag.value = false
}
const renameFolder = (folder: Folder) => {
  // Show rename modal
}
const deleteFolder = (id: string) => {
  folders.value = folders.value.filter(f => f.id !== id)
}

</script>

<template>

  <div class="folders-tags-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-folder" class="text-primary" />
        Folders & Tags
      </h3>
      <UButton size="xs" color="primary" variant="soft" icon="i-heroicons-plus" @click="showCreateFolder = true">
        New Folder
      </UButton>
    </div>

    <div class="panel-content space-y-4">
      <!-- Folders Section -->
      <div class="folders-section">
        <p class="text-sm font-medium mb-2">Folders</p>
        <div class="space-y-1">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="folder-item flex items-center justify-between p-2 rounded-lg cursor-pointer"
            :class="selectedFolder === folder.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="selectFolder(folder.id)"
          >
            <div class="flex items-center gap-2">
              <UIcon :name="folder.icon || 'i-heroicons-folder'" class="w-5 h-5" :class="folder.color" />
              <span class="text-sm">{{ folder.name }}</span>
              <UBadge size="xs" color="gray">{{ folder.count }}</UBadge>
            </div>
            <UDropdown :items="folderActions(folder)" :popper="{ placement: 'bottom-end' }">
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-ellipsis-vertical" />
            </UDropdown>
          </div>
        </div>
      </div>

      <!-- Tags Section -->
      <div class="tags-section">
        <p class="text-sm font-medium mb-2">Tags</p>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
          >
            <UButton
              size="xs"
              :color="selectedTags.includes(tag.id) ? 'primary' : 'gray'"
              variant="soft"
              @click="toggleTag(tag.id)"
            >
              <span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: tag.color }" />
              {{ tag.name }}
              <span class="ml-1 text-xs opacity-70">({{ tag.count }})</span>
            </UButton>
          </div>
          <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-plus" @click="showCreateTag = true">
            Add Tag
          </UButton>
        </div>
      </div>

      <!-- Filter Summary -->
      <div v-if="hasActiveFilters" class="filter-summary p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm">Active filters:</span>
          <UButton size="xs" color="gray" variant="ghost" @click="clearFilters">Clear all</UButton>
        </div>
        <div class="flex flex-wrap gap-1 mt-2">
          <UBadge v-if="selectedFolder" color="blue" size="xs">
            {{ getFolderName(selectedFolder) }}
          </UBadge>
          <UBadge v-for="tagId in selectedTags" :key="tagId" color="primary" size="xs">
            {{ getTagName(tagId) }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Create Folder Modal -->
    <UModal v-model="showCreateFolder">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create Folder</h3>
        
</template>

<style scoped>

.folders-tags-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>