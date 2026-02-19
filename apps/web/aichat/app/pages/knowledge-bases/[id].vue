<script setup lang="ts">

const route = useRoute()
const kbId = route.params.id as string

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: knowledgeBase, refresh } = await useFetch<import('#shared/types/chat').KnowledgeBase>(`/api/knowledge-bases/${kbId}`)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const toast = useToast()
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<any[]>([])

async function handleFileUpload() {
  if (!fileInput.value?.files?.length) return

  const file = fileInput.value.files[0]!
  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  uploadProgress.value = 0

  try {
    await $fetch(`/api/knowledge-bases/${kbId}/files`, {
      method: 'POST',
      body: formData,
    })
    toast.add({ title: 'File uploaded successfully' })
    await refresh()
  } catch (error) {
    console.error('File upload failed', error)
    toast.add({ title: 'Upload failed', description: 'Please try again.', color: 'error' })
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

async function deleteFile(fileId: string) {
  if (confirm('Are you sure you want to delete this file?')) {
    try {
      await $fetch(`/api/knowledge-bases/${kbId}/files/${fileId}`, {
        method: 'DELETE' as any,
      })
      toast.add({ title: 'File deleted' })
      await refresh()
    } catch (error) {
      console.error('File deletion failed', error)
      toast.add({ title: 'Delete failed', description: 'Please try again.', color: 'error' })
    }
  }
}

async function searchKnowledgeBase() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    const results = await $fetch(`/api/knowledge-bases/${kbId}/search`, {
      method: 'POST',
      body: { query: searchQuery.value },
    })
    searchResults.value = results || []
  } catch (error) {
    console.error('Search failed', error)
    toast.add({ title: 'Search failed', description: 'Please try again.', color: 'error' })
  } finally {
    isSearching.value = false
  }
}

const fileStatusColors = {
  pending: 'bg-yellow-200 text-yellow-800',
  processing: 'bg-blue-200 text-blue-800',
  ready: 'bg-green-200 text-green-800',
  error: 'bg-red-200 text-red-800',
}

const fileStatusIcons = {
  pending: 'i-carbon-time',
  processing: 'i-carbon-circle-dash',
  ready: 'i-carbon-checkmark-filled',
  error: 'i-carbon-warning-filled',
}

</script>

<template>

  <div v-if="knowledgeBase" class="p-8">
    <NuxtLink to="/knowledge-bases" class="text-sm text-primary-600 mb-4 block">&larr; Back to all</NuxtLink>
    <h1 class="text-2xl font-bold">{{ knowledgeBase.name }}</h1>
    <p class="text-gray-600 mb-6">{{ knowledgeBase.description }}</p>

    <div class="mb-6">
      <h2 class="text-xl font-bold mb-4">Files</h2>
      <div class="bg-white border rounded-lg p-4">
        <form @submit.prevent="handleFileUpload" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Upload File</label>
            <input
              type="file"
              ref="fileInput"
              class="input w-full"
              :disabled="isUploading"
            />
          </div>
          <div v-if="isUploading" class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
          <button
            type="submit"
            class="btn-primary"
            :disabled="isUploading"
          >
            <span v-if="isUploading">Uploading...</span>
            <span v-else>Upload File</span>
          </button>
        </form>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-xl font-bold mb-4">Search Knowledge Base</h2>
      <div class="bg-white border rounded-lg p-4">
        <form @submit.prevent="searchKnowledgeBase" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Search Query</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search in knowledge base..."
              class="input w-full"
              :disabled="isSearching"
            />
          </div>
          <button
            type="submit"
            class="btn-primary"
            :disabled="isSearching || !searchQuery.trim()"
          >
            <span v-if="isSearching">Searching...</span>
            <span v-else>Search</span>
          </button>
        </form>
        <div v-if="searchResults.length > 0" class="mt-4 space-y-2">
          <h3 class="font-semibold">Search Results</h3>
          <div
            v-for="(result, idx) in searchResults"
            :key="idx"
            class="p-3 border rounded hover:bg-gray-50"
          >
            <p class="text-sm">{{ result.content || result.text }}</p>
            <p class="text-xs text-gray-500 mt-1">Score: {{ result.score?.toFixed(4) || 'N/A' }}</p>
          </div>
        </div>
        <div v-else-if="searchQuery && !isSearching" class="mt-4 text-sm text-gray-500">
          No results found.
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-xl font-bold mb-4">Uploaded Files</h2>
      <div v-if="!knowledgeBase.files || knowledgeBase.files.length === 0" class="text-center py-8 text-gray-500">
        <p>No files uploaded yet.</p>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="file in knowledgeBase.files"
          :key="file.id"
          class="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
        >
          <div class="flex items-center gap-3">
            <span :class="['text-xl', fileStatusIcons[file.status]]"></span>
            <div>
              <p class="font-medium">{{ file.fileName }}</p>
              <p class="text-xs text-gray-500">Status: {{ file.status }}</p>
            </div>
          </div>
          <button
            @click="deleteFile(file.id)"
            class="btn-icon text-red-500 hover:text-red-700"
            title="Delete File"
          >
            <span class="i-carbon-trash-can"></span>
          </button>
        </div>
      </div>
    </div>
  </div>

</template>