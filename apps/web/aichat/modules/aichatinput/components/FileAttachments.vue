<script setup lang="ts">
interface FileItem {
  name: string
  [key: string]: any
}

interface Props {
  files: FileItem[]
  onRemoveFile: (index: number) => void
}

defineProps<Props>()
</script>

<template>
  <div v-if="files.length > 0" class="file-attachments p-2 border-b">
    <div class="flex flex-wrap gap-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="file-item flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded"
      >
        <UIcon name="i-heroicons-paper-clip" class="w-4 h-4" />
        <span class="text-sm">{{ file.name }}</span>
        <UButton size="xs" color="red" variant="ghost" @click="onRemoveFile(index)">
          <UIcon name="i-heroicons-x-mark-20-solid" />
        </UButton>
      </div>
    </div>
  </div>
</template>
