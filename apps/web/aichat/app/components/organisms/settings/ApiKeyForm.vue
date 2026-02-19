<script setup lang="ts">


interface NewKey {
  name: string
  permissions: string[]
  fullKey?: string
}
const modelValue = defineModel<NewKey>({ required: true })
defineProps<{
  creating: boolean
}>()
defineEmits<{
  submit: []
  cancel: []
}>()

</script>

<template>

  <div class="space-y-4">
    <FormGroup label="Key Name">
      <Input v-model="modelValue.name" placeholder="e.g., My Integration" />
    </FormGroup>
    
    <FormGroup label="Permissions (optional)">
      <div class="flex gap-4 flex-wrap">
        <Checkbox v-model="modelValue.permissions" value="chat" label="Chat" />
        <Checkbox v-model="modelValue.permissions" value="agents" label="Agents" />
        <Checkbox v-model="modelValue.permissions" value="read" label="Read Only" />
      </div>
    </FormGroup>
    
    <div v-if="modelValue.fullKey" class="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
      <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
        Copy this key now - you won't see it again!
      </p>
      <code class="text-xs break-all block p-2 bg-yellow-100 dark:bg-yellow-900 rounded">{{ modelValue.fullKey }}</code>
    </div>
    
    <FooterActions
      :cancel-text="modelValue.fullKey ? 'Done' : 'Cancel'"
      :confirm-text="modelValue.fullKey ? 'Done' : 'Create'"
      :loading="creating"
      :disabled="!modelValue.name"
      @cancel="$emit('cancel')"
      @confirm="$emit('submit')"
    />
  </div>

</template>