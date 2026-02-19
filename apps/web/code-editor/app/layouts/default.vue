<script setup>

import { ref } from 'vue'
import FileExplorer from '~/components/FileExplorer.vue'
import DockerPage from '~/pages/docker.vue'
import TasksPage from '~/pages/tasks.vue'
import Terminal from '~/components/Terminal.vue'

const sidebarOpen = ref(true)
const activeView = ref('files')
const showTerminal = ref(false)
const editorState = useEditorState()
const route = useRoute()

function toggleSidebar(view) {
  if (sidebarOpen.value && activeView.value === view) {
    sidebarOpen.value = false
  } else {
    sidebarOpen.value = true
    activeView.value = view
  }
}

function go(path) {
  navigateTo(path)
}

function handleFileSelect(file) {
  if (!editorState.value.openFiles.find(f => f.path === file.path)) {
    editorState.value.openFiles.push(file)
  }
  editorState.value.activeFile = file
  navigateTo('/')
}

</script>

<template>

  <div class="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    <!-- Activity Bar -->
    <div class="w-16 bg-gray-200 dark:bg-gray-900 flex flex-col items-center py-4 space-y-4 flex-shrink-0">
      <button @click="toggleSidebar('files')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': activeView === 'files'}">Files</button>
      <button @click="toggleSidebar('docker')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': activeView === 'docker'}">Docker</button>
      <button @click="toggleSidebar('tasks')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': activeView === 'tasks'}">Tasks</button>
      <button @click="go('/jobs')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': route.path === '/jobs'}">Jobs</button>
      <button @click="go('/history')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': route.path === '/history'}">History</button>
      <button @click="go('/checksums')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': route.path === '/checksums'}">Hash</button>
      <button @click="go('/compression')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': route.path === '/compression'}">Zip</button>
      <button @click="go('/watcher')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': route.path === '/watcher'}">Watch</button>
      <button @click="go('/cloud')" class="p-2 rounded" :class="{'bg-gray-300 dark:bg-gray-700': route.path === '/cloud'}">Cloud</button>
      <button @click="showTerminal = !showTerminal" class="p-2 rounded mt-auto">Term</button>
    </div>

    <!-- Sidebar -->
    <aside v-if="sidebarOpen" class="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-shrink-0">
      <FileExplorer v-if="activeView === 'files'" @file-selected="handleFileSelect" />
      <div v-if="activeView === 'docker'" class="p-2"><DockerPage /></div>
      <div v-if="activeView === 'tasks'" class="p-2"><TasksPage /></div>
    </aside>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Editor Area -->
      <main class="flex-1 overflow-auto">
        <NuxtPage />
      </main>
      <!-- Terminal Panel -->
      <div v-if="showTerminal" class="h-64 flex-shrink-0 border-t-2 border-gray-300 dark:border-gray-700">
        <ClientOnly>
          <Terminal />
        </ClientOnly>
      </div>
    </div>
  </div>

</template>