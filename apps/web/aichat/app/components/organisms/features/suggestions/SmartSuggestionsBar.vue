<script setup lang="ts">

import type { SmartSuggestion, ContextualSuggestion } from '~/shared/types/smartSuggestions'

const props = defineProps<{
  suggestions: SmartSuggestion[]
  contextualSuggestions: ContextualSuggestion | null
  isVisible: boolean
}>()
const emit = defineEmits<{
  execute: [suggestion: SmartSuggestion]
  dismiss: [suggestionId: string]
  regenerate: [messageId: string]
}>()
const containerRef = ref<HTMLElement>()
const showAll = ref(false)
const visibleSuggestions = computed(() => {
  const all = [...props.suggestions]
  if (props.contextualSuggestions) {
    all.push(...props.contextualSuggestions.suggestions)
  }
  return showAll.value ? all : all.slice(0, 5)
})
const groupedSuggestions = computed(() => {
  const groups: Record<string, SmartSuggestion[]> = {}
  visibleSuggestions.value.forEach(s => {
    if (!groups[s.context]) groups[s.context] = []
    groups[s.context].push(s)
  })
  return groups
})
function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    action: 'i-carbon-play',
    question: 'i-carbon-help',
    command: 'i-carbon-terminal',
    shortcut: 'i-carbon-keyboard',
  }
  return icons[type] || 'i-carbon-star'
}

</script>

<template>

  <div
    v-if="isVisible"
    ref="containerRef"
    class="smart-suggestions fixed left-1/2 -translate-x-1/2 bottom-20 z-40"
  >
    <div class="flex flex-col items-center gap-2">
      <div class="suggestions-bar flex items-center gap-1 p-1.5 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <button
          v-for="suggestion in visibleSuggestions.slice(0, 4)"
          :key="suggestion.id"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          :class="{
            'bg-primary-50 text-primary-700 dark:bg-primary-900/20': suggestion.type === 'action',
            'bg-blue-50 text-blue-700 dark:bg-blue-900/20': suggestion.type === 'question',
            'bg-purple-50 text-purple-700 dark:bg-purple-900/20': suggestion.type === 'command',
          }"
          @click="emit('execute', suggestion)"
        >
          <span :class="getIconForType(suggestion.type)" class="text-xs"></span>
          <span>{{ suggestion.label }}</span>
        </button>
        
        <button
          v-if="props.suggestions.length + (props.contextualSuggestions?.suggestions.length || 0) > 4"
          class="btn-icon text-xs"
          @click="showAll = !showAll"
        >
          <span :class="showAll ? 'i-carbon-chevron-down' : 'i-carbon-chevron-up'"></span>
        </button>
      </div>
      
      <div v-if="showAll" class="suggestions-panel p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-64 max-w-md">
        <div v-for="(group, context) in groupedSuggestions" :key="context" class="mb-3 last:mb-0">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">{{ context }}</p>
          <div class="space-y-1">
            <button
              v-for="suggestion in group"
              :key="suggestion.id"
              class="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-sm"
              @click="emit('execute', suggestion)"
            >
              <div class="flex items-center gap-2">
                <span :class="getIconForType(suggestion.type)"></span>
                <span>{{ suggestion.label }}</span>
              </div>
              <button
                class="btn-icon text-xs opacity-0 hover:opacity-100"
                @click.stop="emit('dismiss', suggestion.id)"
              >
                <span class="i-carbon-close"></span>
              </button>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>