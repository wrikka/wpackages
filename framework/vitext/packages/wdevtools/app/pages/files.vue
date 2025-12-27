<script setup lang="ts">
import { join, dirname } from 'pathe';

interface FileEntry {
  name: string;
  isDirectory: boolean;
}

const { data, error, pending, navigateTo, currentPath } = useFiles();

const selectFile = (file: FileEntry) => {
  if (file.isDirectory) {
    const newPath = join(currentPath.value, file.name);
    navigateTo(newPath);
  }
  // Potentially open file content in the future
};

const goUp = () => {
  if (currentPath.value) {
    const parentDir = dirname(currentPath.value);
    navigateTo(parentDir);
  }
};
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">File Explorer</h1>

    <!-- Breadcrumbs and Up Button -->
    <div class="flex items-center gap-4 p-2 bg-gray-800 rounded-lg border border-gray-700">
      <button @click="goUp" :disabled="!currentPath" class="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
        <Icon name="i-mdi-arrow-up" />
      </button>
      <Breadcrumbs :path="currentPath" @navigate="navigateTo" />
    </div>

    <div v-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg">Error: {{ error.message }}</div>

    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <FileExplorerItemSkeleton v-for="i in 8" :key="i" />
    </div>
    
    <div v-else-if="data && data.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <FileExplorerItem v-for="file in data" :key="file.name" :file="file" @click="selectFile(file)" />
    </div>

    <div v-else class="text-center py-10 text-gray-500">
      <Icon name="i-mdi-folder-open-outline" class="text-4xl mb-2" />
      <p>This directory is empty.</p>
    </div>
  </div>
</template>
