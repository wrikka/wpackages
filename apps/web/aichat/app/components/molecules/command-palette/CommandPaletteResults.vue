<template>
  <div class="flex-1 overflow-y-auto p-2">
    <!-- No Results -->
    <div v-if="!hasResults" class="flex flex-col items-center justify-center p-12 text-center">
      <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-300 mb-4" />
      <div class="text-base font-medium text-gray-800 mb-2 dark:text-gray-200">No results found</div>
      <div class="text-sm text-gray-500">Try different keywords or check spelling</div>
    </div>

    <!-- Grouped Results -->
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="(actions, category) in groupedActions"
        :key="category"
        class="flex flex-col"
      >
        <!-- Category Header -->
        <div class="flex items-center gap-2 p-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <UIcon :name="getCategoryIcon(category)" class="w-4 h-4" />
          <span class="flex-1">{{ category }}</span>
          <span class="opacity-70">({{ actions.length }})</span>
        </div>

        <!-- Actions -->
        <div class="flex flex-col">
          <button
            v-for="(action, index) in actions"
            :key="action.id"
            class="flex items-center gap-3 p-3 px-4 border-none bg-transparent text-left cursor-pointer transition-all rounded-lg mx-2 my-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            :class="{ 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800': selectedIndex === getGlobalIndex(action) }"
            @click="$emit('action-select', action)"
            @mouseenter="$emit('select-index', getGlobalIndex(action))"
          >
            <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md text-gray-700 flex-shrink-0 dark:bg-gray-800 dark:text-gray-300">
              <UIcon :name="action.icon" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 mb-0.5 dark:text-gray-100">{{ action.title }}</div>
              <div class="text-xs text-gray-500 truncate">{{ action.description }}</div>
            </div>
            
            <div class="flex items-center gap-2 flex-shrink-0">
              <div v-if="action.shortcut" class="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800 dark:text-gray-400">
                {{ action.shortcut }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommandPaletteAction } from '~/types/command-palette'
import { COMMAND_PALETTE_CATEGORIES } from '~/constants/command-palette'

interface CommandPaletteResultsProps {
  actions: CommandPaletteAction[]
  groupedActions: Record<string, CommandPaletteAction[]>
  selectedIndex: number
  hasResults: boolean
}

const props = defineProps<CommandPaletteResultsProps>()

const emit = defineEmits<{
  'action-select': [action: CommandPaletteAction]
  'select-index': [index: number]
}>()

const getCategoryIcon = (category: string): string => {
  return COMMAND_PALETTE_CATEGORIES[category as keyof typeof COMMAND_PALETTE_CATEGORIES]?.icon || 'i-heroicons-cog-6-tooth'
}

const getGlobalIndex = (action: CommandPaletteAction): number => {
  let index = 0
  for (const category of Object.keys(props.groupedActions)) {
    const actions = props.groupedActions[category]
    const actionIndex = actions.findIndex(a => a.id === action.id)
    if (actionIndex > -1) {
      return index + actionIndex
    }
    index += actions.length
  }
  return 0
}
</script>

