<script setup lang="ts">

import type { ThemePreset, CustomTheme } from '~/shared/types/theme'

const props = defineProps<{
  currentTheme: ThemePreset
  customThemes: CustomTheme[]
}>()
const emit = defineEmits<{
  apply: [theme: ThemePreset]
  saveCustom: [theme: CustomTheme]
  deleteCustom: [themeId: string]
}>()
const isEditing = ref(false)
const editingTheme = ref<Partial<CustomTheme>>({
  name: '',
  colors: { ...props.currentTheme.colors },
  borderRadius: props.currentTheme.borderRadius,
  fontFamily: props.currentTheme.fontFamily,
  fontSize: props.currentTheme.fontSize,
  spacing: props.currentTheme.spacing,
  isDark: props.currentTheme.isDark,
})
const borderRadiusOptions = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'full', label: 'Full' },
]
const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]
const colorKeys = ['primary', 'secondary', 'background', 'surface', 'text', 'accent', 'success', 'warning', 'error'] as const

</script>

<template>

  <div class="theme-builder p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Theme Builder</h3>
      <button class="btn-primary text-sm" @click="isEditing = !isEditing">
        {{ isEditing ? 'Preview' : 'Edit Theme' }}
      </button>
    </div>
    
    <div v-if="isEditing" class="space-y-4">
      <div>
        <label class="text-sm text-gray-500 block mb-2">Theme Name</label>
        <input v-model="editingTheme.name" type="text" class="input w-full" placeholder="My Custom Theme">
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div v-for="color in colorKeys" :key="color">
          <label class="text-xs text-gray-500 block mb-1 capitalize">{{ color }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model="editingTheme.colors![color]"
              type="color"
              class="w-8 h-8 rounded cursor-pointer"
            >
            <input v-model="editingTheme.colors![color]" type="text" class="input text-xs flex-1">
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm text-gray-500 block mb-1">Border Radius</label>
          <select v-model="editingTheme.borderRadius" class="input w-full">
            <option v-for="opt in borderRadiusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-500 block mb-1">Font Size</label>
          <select v-model="editingTheme.fontSize" class="input w-full">
            <option v-for="opt in fontSizeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>
      
      <label class="flex items-center gap-2">
        <input v-model="editingTheme.isDark" type="checkbox">
        <span class="text-sm">Dark Mode</span>
      </label>
      
      <button
        class="btn-primary w-full"
        :disabled="!editingTheme.name"
        @click="emit('saveCustom', editingTheme as CustomTheme)"
      >
        Save Custom Theme
      </button>
    </div>
    
    <div v-else class="space-y-3">
      <div class="preview-card p-4 rounded-lg border-2 border-dashed border-gray-300">
        <h4 class="font-medium mb-2">Preview</h4>
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-1 rounded" :style="{ background: currentTheme.colors.primary, color: 'white' }">Primary</button>
          <button class="px-3 py-1 rounded" :style="{ background: currentTheme.colors.secondary, color: 'white' }">Secondary</button>
          <span class="px-2 py-1 rounded" :style="{ background: currentTheme.colors.success, color: 'white' }">Success</span>
          <span class="px-2 py-1 rounded" :style="{ background: currentTheme.colors.warning, color: 'white' }">Warning</span>
          <span class="px-2 py-1 rounded" :style="{ background: currentTheme.colors.error, color: 'white' }">Error</span>
        </div>
      </div>
      
      <div class="custom-themes">
        <h4 class="text-sm font-medium mb-2">Custom Themes</h4>
        <div v-if="customThemes.length === 0" class="text-sm text-gray-500">No custom themes yet</div>
        <div v-else class="space-y-2">
          <div
            v-for="theme in customThemes"
            :key="theme.id"
            class="flex items-center justify-between p-2 rounded-lg border"
            :style="{ borderColor: theme.colors.primary }"
          >
            <span class="text-sm">{{ theme.name }}</span>
            <div class="flex gap-1">
              <button class="btn-icon text-xs" @click="emit('apply', theme)">
                <span class="i-carbon-checkmark"></span>
              </button>
              <button class="btn-icon text-xs text-red-500" @click="emit('deleteCustom', theme.id)">
                <span class="i-carbon-trash-can"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>