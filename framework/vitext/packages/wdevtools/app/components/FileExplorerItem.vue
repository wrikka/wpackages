/<script setup lang="ts">
interface FileEntry {
  name: string;
  isDirectory: boolean;
}

defineProps<{ 
  file: FileEntry;
}>();
</script>

<template>
  <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer transition-colors">
    <Icon :name="file.isDirectory ? 'i-mdi-folder' : 'i-mdi-file-outline'" class="text-xl text-gray-400" />
    <span>{{ file.name }}</span>
  </div>
</template>
