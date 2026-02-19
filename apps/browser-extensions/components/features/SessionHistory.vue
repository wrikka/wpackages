<script setup lang="ts">

import { useSessionHistory } from '@/composables/useSessionHistory'
import { History, Search, Trash2, Filter, X } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'

const {
  filteredHistory,
  filter,
  searchQuery,
  historyStats,
  clearHistory,
  deleteHistoryItem,
} = useSessionHistory()

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'chat', label: 'Chat' },
  { value: 'summary', label: 'Summary' },
  { value: 'bookmark', label: 'Bookmarks' },
  { value: 'note', label: 'Notes' },
] as const

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'chat': return '💬'
    case 'summary': return '📝'
    case 'bookmark': return '🔖'
    case 'note': return '📋'
    default: return '📄'
  }
}

</script>

<template>

  <div class="flex flex-col h-full">
    <!-- Header Stats -->
    <div class="grid grid-cols-3 gap-2 p-3 border-b">
      <div class="text-center p-2 rounded-lg bg-primary/10">
        <div class="text-lg font-bold text-primary">{{ historyStats.total }}</div>
        <div class="text-xs text-muted-foreground">Total</div>
      </div>
      <div class="text-center p-2 rounded-lg bg-secondary">
        <div class="text-lg font-bold">{{ historyStats.today }}</div>
        <div class="text-xs text-muted-foreground">Today</div>
      </div>
      <div class="text-center p-2 rounded-lg bg-muted">
        <div class="text-lg font-bold">{{ filteredHistory.length }}</div>
        <div class="text-xs text-muted-foreground">Filtered</div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="p-3 border-b space-y-2">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search history..."
          class="input pl-9 w-full"
        />
        <button
          v-if="searchQuery"
          class="absolute right-3 top-1/2 -translate-y-1/2"
          @click="searchQuery = ''"
        >
          <X class="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div class="flex items-center gap-1">
        <Filter class="h-4 w-4 text-muted-foreground mr-1" />
        <button
          v-for="option in filterOptions"
          :key="option.value"
          :class="[
            'px-2 py-1 rounded text-xs font-medium transition-colors',
            filter === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          ]"
          @click="filter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <div
        v-for="item in filteredHistory"
        :key="item.id"
        class="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <span class="text-lg">{{ getTypeIcon(item.type) }}</span>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">
            {{ item.title || item.content?.slice(0, 50) || 'Untitled' }}
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{{ formatDate(item.timestamp) }}</span>
            <span v-if="item.url" class="truncate">• {{ new URL(item.url).hostname }}</span>
          </div>
        </div>
        <button
          class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
          @click="deleteHistoryItem(item.id)"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>

      <div v-if="filteredHistory.length === 0" class="text-center py-8 text-muted-foreground">
        <History class="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">No history items found</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-3 border-t">
      <Button
        variant="outline"
        class="w-full btn-outline"
        @click="clearHistory"
      >
        <Trash2 class="h-4 w-4 mr-2" />
        Clear All History
      </Button>
    </div>
  </div>

</template>