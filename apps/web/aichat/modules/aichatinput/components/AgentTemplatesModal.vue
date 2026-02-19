<script setup lang="ts">

import type { SavedPrompt } from '~/shared/types/chat'

const props = defineProps<{
  modelValue: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [template: SavedPrompt]
}>()
const templatesStore = useTemplatesStore()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})
const showCreateModal = ref(false)
const selectedCategory = ref('All')
const categories = ['All', 'General', 'Development', 'Writing', 'Analysis', 'Creative', 'Business', 'Education']
const templateCategories = categories.filter(c => c !== 'All')
const newTemplate = ref({
  name: '',
  description: '',
  systemPrompt: '',
  category: 'General',
  isPublic: false,
})
const isValid = computed(() => {
  return newTemplate.value.name.trim() && newTemplate.value.systemPrompt.trim()
})
const filteredTemplates = computed(() => {
  let templates = templatesStore.templates
  if (selectedCategory.value !== 'All') {
    templates = templates.filter((t: SavedPrompt) => t.category === selectedCategory.value)
  }
  return templates
})
const selectTemplate = (template: SavedPrompt) => {
  emit('select', template)
  isOpen.value = false
}
const createTemplate = async () => {
  await templatesStore.createTemplate(newTemplate.value)
  newTemplate.value = {
    name: '',
    description: '',
    systemPrompt: '',
    category: 'General',
    isPublic: false,
  }
  showCreateModal.value = false
}
onMounted(() => {
  templatesStore.fetchTemplates()
})

</script>

<template>

  <div class="agent-templates-modal">
    <Modal v-model="isOpen" width="full">
      <Card>
        <template #header>
          <ModalHeader
            title="Agent Templates"
            subtitle="Choose from templates or create your own"
            button-text="Create Template"
            button-icon="plus"
            button-variant="primary"
            @button-click="showCreateModal = true"
          />
        
</template>