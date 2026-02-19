<script setup lang="ts">

import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { Sun, Moon, Monitor } from 'lucide-vue-next'

const { settings, saveSettings } = useStorage()

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const currentTheme = computed(() => settings.value.theme)

const setTheme = async (theme: 'light' | 'dark' | 'system') => {
  settings.value.theme = theme
  await saveSettings()
  applyTheme(theme)
}

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

// Apply theme on mount
applyTheme(currentTheme.value)

</script>

<template>

  <div class="flex items-center gap-2 p-1 rounded-lg bg-muted">
    <button
      v-for="option in themeOptions"
      :key="option.value"
      :class="[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
        currentTheme === option.value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ]"
      @click="setTheme(option.value as 'light' | 'dark' | 'system')"
    >
      <component :is="option.icon" class="h-4 w-4" />
      <span>{{ option.label }}</span>
    </button>
  </div>

</template>