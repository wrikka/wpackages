<script setup>

import { ref, watch, computed } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const editorState = useEditorState()

const content = ref('')
const originalContent = ref('')
const pending = ref(false)

const isDirty = computed(() => content.value !== originalContent.value)

const language = computed(() => {
  if (!editorState.value.activeFile) return 'plaintext'
  const extension = editorState.value.activeFile.name.split('.').pop()
  switch (extension) {
    case 'js': return 'javascript'
    case 'ts': return 'typescript'
    case 'json': return 'json'
    case 'vue': return 'vue'
    case 'md': return 'markdown'
    default: return 'plaintext'
  }
})

watch(() => editorState.value.activeFile, async (newFile) => {
  if (newFile && newFile.path) {
    pending.value = true
    try {
      const response = await $fetch(`/api/files/content?path=${newFile.path}`)
      content.value = response.content
      originalContent.value = response.content
    } catch (error) {
      content.value = `Error loading file: ${error.message}`
      originalContent.value = content.value
    } finally {
      pending.value = false
    }
  } else {
    content.value = ''
    originalContent.value = ''
  }
}, { immediate: true, deep: true })

function setActiveFile(file) {
  editorState.value.activeFile = file
}

function closeFile(fileToClose) {
  const index = editorState.value.openFiles.findIndex(f => f.path === fileToClose.path)
  if (index === -1) return

  editorState.value.openFiles.splice(index, 1)

  if (editorState.value.activeFile?.path === fileToClose.path) {
    if (editorState.value.openFiles.length > 0) {
      editorState.value.activeFile = editorState.value.openFiles[Math.max(0, index - 1)]
    } else {
      editorState.value.activeFile = null
    }
  }
}

async function saveFile() {
  if (!isDirty.value || !editorState.value.activeFile) return
  try {
    await $fetch('/api/files/content', {
      method: 'POST',
      body: { path: editorState.value.activeFile.path, content: content.value }
    })
    originalContent.value = content.value
    alert('File saved successfully!')
  } catch (error) {
    alert(`Error saving file: ${error.message}`)
  }
}

</script>

<template>

  <div class="h-full bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
    <div v-if="editorState.activeFile" class="h-full flex flex-col">
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-between pr-2">
        <div class="flex">
          <div 
            v-for="file in editorState.openFiles" 
            :key="file.path" 
            @click="setActiveFile(file)"
            class="flex items-center px-4 py-2 cursor-pointer border-r dark:border-gray-700"
            :class="{'bg-gray-100 dark:bg-gray-700': editorState.activeFile?.path === file.path}"
          >
            <span>{{ file.name }}</span>
            <button @click.stop="closeFile(file)" class="ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">×</button>
          </div>
        </div>
        <button @click="saveFile" :disabled="!isDirty" class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Save</button>
      </div>
      
      <!-- Editor -->
      <div class="flex-1 overflow-hidden">
        <div v-if="pending" class="flex items-center justify-center h-full">Loading content...</div>
        <ClientOnly v-else>
          <MonacoEditor v-model="content" :language="language" />
        </ClientOnly>
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-full text-gray-500">
      <p>Select a file from the explorer to view its content.</p>
    </div>
  </div>

</template>