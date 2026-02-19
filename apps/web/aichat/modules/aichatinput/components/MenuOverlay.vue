<script setup lang="ts">
interface MenuItem {
  id: string | number
  label: string
  insert: string
  [key: string]: any
}

interface Props {
  isOpen: boolean
  menuType: 'mention' | 'command' | 'template' | 'prompt'
  items: MenuItem[]
  onSelectItem: (item: MenuItem) => void
}

defineProps<Props>()

const getMenuTitle = (type: string) => {
  switch (type) {
    case 'mention': return 'Mentions'
    case 'command': return 'Commands'
    case 'template': return 'Templates'
    case 'prompt': return 'Prompts'
    default: return 'Menu'
  }
}
</script>

<template>
  <div v-if="isOpen" class="menu-overlay absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
    <div class="p-2">
      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        {{ getMenuTitle(menuType) }}
      </div>
      <div class="space-y-1 max-h-60 overflow-y-auto">
        <div
          v-for="item in items"
          :key="item.id"
          class="menu-item px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
          @click="onSelectItem(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-overlay {
  max-height: 300px;
}
</style>
