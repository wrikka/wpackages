<script setup lang="ts">

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'General', icon: 'i-lucide-settings' },
  { id: 'theme', label: 'Theme', icon: 'i-lucide-palette' },
  { id: 'profiles', label: 'Profiles', icon: 'i-lucide-user' },
  { id: 'hotkeys', label: 'Hotkeys', icon: 'i-lucide-keyboard' },
  { id: 'clipboard', label: 'Clipboard', icon: 'i-lucide-clipboard' },
  { id: 'sessions', label: 'Sessions', icon: 'i-lucide-save' },
]

</script>

<template>

  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="emit('close')"
  >
    <div class="h-[600px] w-[800px] rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
      <div class="flex h-full">
        <div class="w-48 border-r border-gray-700 p-4">
          <h2 class="mb-4 text-sm font-semibold text-white">Settings</h2>
          <div class="space-y-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
              :class="activeTab === tab.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
              @click="activeTab = tab.id"
            >
              <div :class="tab.icon" />
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="flex-1 p-6">
          <div v-if="activeTab === 'general'" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">General Settings</h3>
            <p class="text-sm text-gray-400">Configure general terminal settings</p>
          </div>
          <div v-else-if="activeTab === 'theme'" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Theme Settings</h3>
            <p class="text-sm text-gray-400">Customize terminal appearance</p>
          </div>
          <div v-else-if="activeTab === 'profiles'" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Profile Settings</h3>
            <p class="text-sm text-gray-400">Manage terminal profiles</p>
          </div>
          <div v-else-if="activeTab === 'hotkeys'" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Hotkey Settings</h3>
            <p class="text-sm text-gray-400">Configure keyboard shortcuts</p>
          </div>
          <div v-else-if="activeTab === 'clipboard'" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Clipboard Settings</h3>
            <p class="text-sm text-gray-400">Manage clipboard history</p>
          </div>
          <div v-else-if="activeTab === 'sessions'" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Session Settings</h3>
            <p class="text-sm text-gray-400">Save and restore sessions</p>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between border-t border-gray-700 px-6 py-3">
        <div class="text-xs text-gray-400">Settings are automatically saved</div>
        <button
          class="rounded-md border border-gray-700 px-4 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>

</template>