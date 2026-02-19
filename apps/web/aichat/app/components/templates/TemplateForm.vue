<script setup lang="ts">


interface TemplateForm {
  name: string
  description: string
  systemPrompt: string
  category: string
  isPublic: boolean
}
defineProps<{
  modelValue: TemplateForm
  categories: string[]
  isValid: boolean
}>()
defineEmits<{
  'update:modelValue': [value: TemplateForm]
  submit: []
  cancel: []
}>()

</script>

<template>

  <div class="space-y-4">
    <FormGroup label="Name">
      <Input v-model="modelValue.name" placeholder="Template name..." />
    </FormGroup>
    
    <FormGroup label="Description">
      <Textarea v-model="modelValue.description" placeholder="Brief description..." :rows="2" />
    </FormGroup>
    
    <FormGroup label="Category">
      <Select v-model="modelValue.category" :options="categories" />
    </FormGroup>
    
    <FormGroup label="System Prompt">
      <Textarea v-model="modelValue.systemPrompt" placeholder="Enter system prompt..." :rows="6" />
    </FormGroup>
    
    <Checkbox v-model="modelValue.isPublic" label="Make this template public" />
    
    <div class="flex justify-end gap-2 pt-4">
      <Button variant="secondary" @click="$emit('cancel')">
        Cancel
      </Button>
      <Button variant="primary" :disabled="!isValid" @click="$emit('submit')">
        Create
      </Button>
    </div>
  </div>

</template>