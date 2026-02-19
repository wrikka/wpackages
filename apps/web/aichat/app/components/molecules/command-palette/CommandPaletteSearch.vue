<template>
  <div class="p-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-3 p-3 px-4 bg-gray-50 rounded-lg border-2 border-transparent transition-all dark:bg-gray-800 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
      <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-gray-500" />
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent border-none outline-none text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
        :placeholder="placeholder"
        @keydown="$emit('keydown', $event)"
        @keydown.enter.prevent
      />
      <button
        v-if="searchQuery"
        class="flex items-center justify-center w-6 h-6 border-none bg-transparent text-gray-500 rounded cursor-pointer transition-all hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        @click="$emit('clear')"
      >
        <UIcon name="i-heroicons-x-mark-20-solid" />
      </button>
    </div>
    
    <!-- Search Stats -->
    <div v-if="searchQuery" class="mt-2 px-1">
      <span class="text-xs text-gray-500">{{ resultCount }} results</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface CommandPaletteSearchProps {
  placeholder?: string
  resultCount?: number
  modelValue?: string
}

const props = withDefaults(defineProps<CommandPaletteSearchProps>(), {
  placeholder: "Type a command or search...",
  resultCount: 0,
  modelValue: ""
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'keydown': [event: KeyboardEvent]
  'clear': []
}>()

const searchQuery = ref(props.modelValue)
const searchInput = ref<HTMLInputElement | null>(null)

const focus = () => {
  searchInput.value?.focus()
}

const clear = () => {
  searchQuery.value = ''
  emit('clear')
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// Emit changes
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue)
})

defineExpose({
  focus,
  clear
})
</script>

