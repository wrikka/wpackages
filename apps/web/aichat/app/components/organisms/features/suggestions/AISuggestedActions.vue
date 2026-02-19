<script setup lang="ts">


interface SuggestedAction {
  id: string
  label: string
  icon: string
  action: string
  confidence: number
}
const emit = defineEmits<{
  execute: [action: string]
}>()
const suggestedActions = ref<SuggestedAction[]>([
  { id: '1', label: 'Explain this code', icon: 'i-heroicons-code-bracket', action: 'explain_code', confidence: 0.92 },
  { id: '2', label: 'Add tests', icon: 'i-heroicons-beaker', action: 'add_tests', confidence: 0.85 },
  { id: '3', label: 'Refactor', icon: 'i-heroicons-sparkles', action: 'refactor', confidence: 0.78 },
  { id: '4', label: 'Document', icon: 'i-heroicons-document-text', action: 'document', confidence: 0.71 }
])
const executeAction = (action: SuggestedAction) => {
  emit('execute', action.action)
}

</script>

<template>

  <div class="suggested-actions">
    <p class="text-xs text-gray-500 mb-2">Suggested actions based on context</p>
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="action in suggestedActions"
        :key="action.id"
        size="xs"
        color="primary"
        variant="soft"
        :icon="action.icon"
        @click="executeAction(action)"
      >
        {{ action.label }}
      </UButton>
    </div>
  </div>

</template>