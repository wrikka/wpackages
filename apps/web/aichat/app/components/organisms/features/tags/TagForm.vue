<script setup lang="ts">


const name = defineModel<string>('name', { required: true })
const color = defineModel<string>('color', { required: true })
defineProps<{
  colors: string[]
}>()
defineEmits<{
  submit: []
  cancel: []
  'update:color': [value: string]
}>()

</script>

<template>

  <div class="space-y-4">
    <FormGroup label="Tag Name">
      <Input
        v-model="name"
        placeholder="Enter tag name..."
        maxlength="50"
      />
    </FormGroup>
    
    <FormGroup label="Color">
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="c in colors"
          :key="c"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'"
          :style="{ backgroundColor: c }"
          @click="$emit('update:color', c)"
        />
      </div>
    </FormGroup>
    
    <FooterActions
      cancel-text="Cancel"
      confirm-text="Create"
      :disabled="!name.trim()"
      @cancel="$emit('cancel')"
      @confirm="$emit('submit')"
    />
  </div>

</template>