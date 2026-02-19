<script setup lang="ts">


const props = defineProps<{
  conversationId: string
  modelValue: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})
const selectedFormat = ref('markdown')
const exporting = ref(false)
const formats = [
  { value: 'markdown', label: 'Markdown', extension: 'md', icon: 'lucide:file-text' },
  { value: 'json', label: 'JSON', extension: 'json', icon: 'lucide:code' },
  { value: 'txt', label: 'Plain Text', extension: 'txt', icon: 'lucide:file' },
]
const exportConversation = async () => {
  exporting.value = true
  try {
    const response = await $fetch('/api/export', {
      method: 'POST',
      body: {
        conversationId: props.conversationId,
        format: selectedFormat.value,
      },
    })
    const blob = new Blob([response as string], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${props.conversationId}.${selectedFormat.value === 'markdown' ? 'md' : selectedFormat.value}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    isOpen.value = false
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    exporting.value = false
  }
}

</script>

<template>

  <div class="export-modal">
    <Modal v-model="isOpen" width="md">
      <Card>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">Export Conversation</h3>
            <p class="text-sm text-gray-500">Download this conversation in your preferred format</p>
          </div>
        
</template>