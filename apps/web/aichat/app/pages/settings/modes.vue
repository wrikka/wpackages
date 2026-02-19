<script setup lang="ts">

import draggable from 'vuedraggable';
import { useModesStore } from '~/stores/modes';
import type { ModeConfig } from '#shared/config/modes';
import type { ChatMode } from '#shared/types/common';

definePageMeta({
  layout: 'settings',
});

const modesStore = useModesStore();
const { modes } = storeToRefs(modesStore);

// Use a local ref to avoid direct mutation issues with draggable
const localModes = ref([...modes.value]);

watch(modes, (next) => {
  localModes.value = [...next]
}, { deep: true })

watch(localModes, (newOrder) => {
  modesStore.setAllModes(newOrder);
}, { deep: true });

const onToggle = (mode: ModeConfig) => {
  modesStore.updateMode(mode.id, { enabled: !mode.enabled });
};

const baseModeOptions: Array<{ label: string; value: ChatMode }> = [
  { label: 'Chat', value: 'chat' },
  { label: 'Research', value: 'research' },
  { label: 'Code', value: 'code' },
  { label: 'Agent', value: 'agent' },
  { label: 'Image', value: 'image' },
  { label: 'Translate', value: 'translate' },
  { label: 'Learn', value: 'learn' },
  { label: 'Compare', value: 'compare' },
  { label: 'Explain', value: 'explain' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Summarize', value: 'summarize' },
  { label: 'Tutor', value: 'tutor' },
  { label: 'Writer', value: 'writer' },
  { label: 'Copywriting', value: 'copywriting' },
  { label: 'Analyze', value: 'analyze' },
  { label: 'Review', value: 'review' },
  { label: 'Organize', value: 'organize' },
  { label: 'Present', value: 'present' },
]

const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref<{ label: string; description: string; icon: string; baseMode: ChatMode; defaultPrompt: string }>(
  {
    label: '',
    description: '',
    icon: 'i-carbon-idea',
    baseMode: 'chat',
    defaultPrompt: '',
  },
)

const openCreate = () => {
  editingId.value = null
  form.value = {
    label: '',
    description: '',
    icon: 'i-carbon-idea',
    baseMode: 'chat',
    defaultPrompt: '',
  }
  isModalOpen.value = true
}

const openEdit = (mode: ModeConfig) => {
  editingId.value = mode.id
  form.value = {
    label: mode.label,
    description: mode.description,
    icon: mode.icon,
    baseMode: (mode.baseMode || 'chat') as ChatMode,
    defaultPrompt: mode.defaultPrompt || '',
  }
  isModalOpen.value = true
}

const save = () => {
  const trimmedLabel = form.value.label.trim()
  const trimmedDescription = form.value.description.trim()
  if (!trimmedLabel || !trimmedDescription) {
    return
  }

  if (editingId.value) {
    modesStore.updateMode(editingId.value, {
      label: trimmedLabel,
      description: trimmedDescription,
      icon: form.value.icon.trim(),
      baseMode: form.value.baseMode,
      defaultPrompt: form.value.defaultPrompt,
    })
  } else {
    modesStore.createCustomMode({
      label: trimmedLabel,
      description: trimmedDescription,
      icon: form.value.icon.trim(),
      baseMode: form.value.baseMode,
      defaultPrompt: form.value.defaultPrompt,
    })
  }

  isModalOpen.value = false
}

const remove = (modeId: string) => {
  modesStore.deleteMode(modeId)
}

</script>

<template>

  <div>
    <h1 class="text-2xl font-bold mb-4">Customize Chat Modes</h1>
    <p class="text-gray-600 mb-6">Drag and drop to reorder modes, or use the toggle to enable/disable them.</p>

    <div class="mb-4 flex items-center justify-between">
      <button type="button" class="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700" @click="openCreate">
        Add Custom Mode
      </button>
      <div class="text-sm text-gray-500">Custom modes start with <span class="font-mono">custom:</span></div>
    </div>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">{{ editingId ? 'Edit Custom Mode' : 'Create Custom Mode' }}</h2>
        
</template>

<style scoped>

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

</style>