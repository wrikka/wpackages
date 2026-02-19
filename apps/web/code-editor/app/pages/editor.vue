<script setup lang="ts">

// Page metadata
definePageMeta({
  title: 'Code Editor',
  description: 'Write and edit code',
})

// Reactive state
const files = ref([
  { id: 1, name: 'index.ts', content: 'console.log("Hello, World!");', language: 'typescript' },
  { id: 2, name: 'README.md', content: '# Project\n\nDescription here...', language: 'markdown' },
])

const activeFile = ref(files.value[0])
const editorContainer = ref<HTMLElement>()
const currentLine = ref(1)
const currentColumn = ref(1)

// File operations
const selectFile = (file: any) => {
  activeFile.value = file
}

const createFile = () => {
  const name = prompt('Enter file name:')
  if (name) {
    const newFile = {
      id: Date.now(),
      name,
      content: '',
      language: getFileLanguage(name),
    }
    files.value.push(newFile)
    activeFile.value = newFile
  }
}

const deleteFile = (fileId: number) => {
  if (confirm('Are you sure you want to delete this file?')) {
    files.value = files.value.filter((f: any) => f.id !== fileId)
    if (activeFile.value?.id === fileId) {
      activeFile.value = files.value[0] || null
    }
  }
}

// Editor operations
const saveCode = () => {
  if (activeFile.value) {
    // Here you would save to backend
    console.log('Saving file:', activeFile.value.name)
    // Show success notification
    console.log('File saved:', activeFile.value.name)
  }
}

const runCode = () => {
  if (activeFile.value) {
    // Here you would execute code
    console.log('Running code:', activeFile.value.content)
    // Show execution result
    console.log('Code executed successfully')
  }
}

// Utility functions
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    'ts': 'i-heroicons-code-bracket',
    'js': 'i-heroicons-code-bracket',
    'vue': 'i-simple-icons-vuedotjs',
    'md': 'i-heroicons-document-text',
    'json': 'i-heroicons-document-duplicate',
    'css': 'i-heroicons-paint-brush',
    'html': 'i-heroicons-globe-alt',
  }
  return iconMap[ext || ''] || 'i-heroicons-document'
}

const getFileLanguage = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'js': 'javascript',
    'vue': 'vue',
    'md': 'markdown',
    'json': 'json',
    'css': 'css',
    'html': 'html',
  }
  return langMap[ext || ''] || 'plaintext'
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        saveCode()
        break
      case 'Enter':
        event.preventDefault()
        runCode()
        break
    }
  }
}

// Initialize Monaco Editor (placeholder - would need actual Monaco setup)
onMounted(() => {
  if (editorContainer.value && activeFile.value) {
    // Monaco editor initialization would go here
    console.log('Editor container mounted')
  }
})

</script>

<template>

  <div class="w-full h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 z-10">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center space-x-4">
          <UButton color="gray" variant="ghost" @click="navigateTo('/')">
            <Icon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
            Back to Dashboard
          </UButton>
          <h1 class="text-lg font-semibold text-gray-900">Code Editor</h1>
        </div>
        <div class="flex items-center space-x-2">
          <UButton color="primary" variant="soft" @click="runCode">
            <Icon name="i-heroicons-play" class="w-4 h-4 mr-2" />
            Run
          </UButton>
          <UButton color="green" variant="soft" @click="saveCode">
            <Icon name="i-heroicons-document-check" class="w-4 h-4 mr-2" />
            Save
          </UButton>
        </div>
      </div>
    </header>

    <!-- Main Editor Area -->
    <div class="flex-1 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-sm font-medium text-gray-900 mb-3">Files</h2>
          <UButton color="primary" variant="soft" size="sm" class="w-full" @click="createFile">
            <Icon name="i-heroicons-plus" class="w-3 h-3 mr-1" />
            New File
          </UButton>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-1">
            <div 
              v-for="file in files" 
              :key="file.id"
              class="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              :class="{ 'bg-blue-50 text-blue-700': activeFile?.id === file.id }"
              @click="selectFile(file)"
            >
              <div class="flex items-center">
                <Icon :name="getFileIcon(file.name)" class="w-4 h-4 mr-2" />
                <span class="text-sm">{{ file.name }}</span>
              </div>
              <UButton 
                color="red" 
                variant="ghost" 
                size="2xs"
                @click.stop="deleteFile(file.id)"
              >
                <Icon name="i-heroicons-trash" class="w-3 h-3" />
              </UButton>
            </div>
          </div>
        </div>
      </aside>

      <!-- Editor -->
      <main class="flex-1 flex flex-col">
        <div v-if="!activeFile" class="flex-1 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <Icon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p class="text-lg">Select a file to start editing</p>
            <p class="text-sm mt-2">Or create a new file to get started</p>
          </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col">
          <!-- File Header -->
          <div class="bg-white border-b border-gray-200 px-4 py-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon :name="getFileIcon(activeFile.name)" class="w-4 h-4 mr-2 text-gray-600" />
                <span class="text-sm font-medium text-gray-900">{{ activeFile.name }}</span>
              </div>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <span>Line {{ currentLine }}, Column {{ currentColumn }}</span>
                <span>•</span>
                <span>{{ activeFile.language }}</span>
              </div>
            </div>
          </div>
          
          <!-- Code Editor Container -->
          <div class="flex-1 relative">
            <div 
              ref="editorContainer" 
              class="w-full h-full"
              @keydown="handleKeydown"
            ></div>
          </div>
        </div>
      </main>
    </div>
  </div>

</template>