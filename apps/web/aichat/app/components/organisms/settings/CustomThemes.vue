<script setup lang="ts">


const selectedTheme = ref('default')
const presetThemes = ref([
  { id: 'default', name: 'Default', preview: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', textColor: 'text-white' },
  { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #06b6d4, #3b82f6)', textColor: 'text-white' },
  { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #10b981, #059669)', textColor: 'text-white' },
  { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #f59e0b, #ef4444)', textColor: 'text-white' },
  { id: 'dark', name: 'Midnight', preview: 'linear-gradient(135deg, #1f2937, #111827)', textColor: 'text-white' },
  { id: 'light', name: 'Clean', preview: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', textColor: 'text-gray-800' },
  { id: 'purple', name: 'Berry', preview: 'linear-gradient(135deg, #8b5cf6, #d946ef)', textColor: 'text-white' },
  { id: 'mono', name: 'Mono', preview: 'linear-gradient(135deg, #6b7280, #374151)', textColor: 'text-white' }
])
const themeColors = [
  { key: 'primary', label: 'Primary Color' },
  { key: 'secondary', label: 'Secondary Color' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'text', label: 'Text Color' }
]
const customTheme = ref({
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  background: '#ffffff',
  surface: '#f3f4f6',
  text: '#1f2937'
})
const fontSettings = ref({
  family: 'system',
  size: 14
})
const fontOptions = [
  { label: 'System Default', value: 'system' },
  { label: 'Inter', value: 'inter' },
  { label: 'Roboto', value: 'roboto' },
  { label: 'Monospace', value: 'mono' }
]
const previewStyle = computed(() => ({
  backgroundColor: customTheme.value.surface,
  color: customTheme.value.text,
  fontSize: `${fontSettings.value.size}px`
}))
const selectTheme = (id: string) => {
  selectedTheme.value = id
  // Apply preset colors
}
const saveTheme = () => {
  // Save custom theme
}
const exportTheme = () => {
  const themeData = JSON.stringify(customTheme.value, null, 2)
  // Export logic
}
const resetTheme = () => {
  customTheme.value = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#1f2937'
  }
}

</script>

<template>

  <div class="custom-themes-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-paint-brush" class="text-primary" />
        Custom Themes
      </h3>
    </div>

    <div class="panel-content space-y-4">
      <!-- Preset Themes -->
      <div class="preset-themes">
        <p class="text-sm font-medium mb-2">Preset Themes</p>
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="theme in presetThemes"
            :key="theme.id"
            class="theme-preset p-3 rounded-lg cursor-pointer border-2 transition-all"
            :class="selectedTheme === theme.id ? 'border-primary' : 'border-transparent hover:border-gray-300'"
            :style="{ background: theme.preview }"
            @click="selectTheme(theme.id)"
          >
            <p class="text-xs font-medium text-center" :class="theme.textColor">{{ theme.name }}</p>
          </div>
        </div>
      </div>

      <!-- Custom Colors -->
      <div class="custom-colors">
        <p class="text-sm font-medium mb-2">Custom Colors</p>
        <div class="space-y-3">
          <div v-for="color in themeColors" :key="color.key" class="color-item flex items-center justify-between">
            <span class="text-sm">{{ color.label }}</span>
            <div class="flex items-center gap-2">
              <input
                v-model="customTheme[color.key]"
                type="color"
                class="w-8 h-8 rounded cursor-pointer"
              >
              <UInput v-model="customTheme[color.key]" size="xs" class="w-24" />
            </div>
          </div>
        </div>
      </div>

      <!-- Font Settings -->
      <div class="font-settings">
        <p class="text-sm font-medium mb-2">Typography</p>
        <div class="space-y-2">
          <UFormGroup label="Font Family">
            <USelect v-model="fontSettings.family" :options="fontOptions" />
          </UFormGroup>
          <UFormGroup label="Base Size">
            <URange v-model="fontSettings.size" :min="12" :max="20" />
          </UFormGroup>
        </div>
      </div>

      <!-- Preview -->
      <div class="theme-preview p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p class="text-xs text-gray-500 mb-2">Preview</p>
        <div class="preview-content p-3 rounded" :style="previewStyle">
          <p class="font-medium">Chat Message</p>
          <p class="text-sm opacity-80">This is how your chat will look</p>
          <UButton size="xs" color="primary" class="mt-2">Button</UButton>
        </div>
      </div>

      <!-- Actions -->
      <div class="theme-actions flex gap-2">
        <UButton size="sm" color="primary" block @click="saveTheme">Save Theme</UButton>
        <UButton size="sm" color="gray" variant="soft" @click="exportTheme">Export</UButton>
        <UButton size="sm" color="gray" variant="soft" @click="resetTheme">Reset</UButton>
      </div>
    </div>
  </div>

</template>

<style scoped>

.custom-themes-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>