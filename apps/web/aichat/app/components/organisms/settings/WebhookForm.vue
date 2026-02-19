<script setup lang="ts">


interface Webhook {
  id?: string
  name: string
  url: string
  secret?: string
  events: string[]
  isActive: boolean
}
const modelValue = defineModel<Partial<Webhook>>({ required: true })
defineProps<{
  availableEvents: string[]
  editing: boolean
}>()
defineEmits<{
  submit: []
  cancel: []
}>()

</script>

<template>

  <div class="space-y-4">
    <FormGroup label="Name">
      <Input v-model="modelValue.name" placeholder="Webhook name..." />
    </FormGroup>
    
    <FormGroup label="URL">
      <Input v-model="modelValue.url" placeholder="https://..." />
    </FormGroup>
    
    <FormGroup label="Secret (optional)">
      <Input v-model="modelValue.secret" placeholder="For signature verification" />
    </FormGroup>
    
    <FormGroup label="Events">
      <div class="flex flex-wrap gap-4">
        <Checkbox
          v-for="event in availableEvents"
          :key="event"
          v-model="modelValue.events"
          :value="event"
          :label="event"
        />
      </div>
    </FormGroup>
    
    <Checkbox v-model="modelValue.isActive" label="Active" />
    
    <FooterActions
      cancel-text="Cancel"
      :confirm-text="editing ? 'Update' : 'Create'"
      @cancel="$emit('cancel')"
      @confirm="$emit('submit')"
    />
  </div>

</template>