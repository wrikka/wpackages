<script setup lang="ts">


interface WidgetConfig {
  color: string
  position: string
  welcomeMessage: string
  showAvatar: boolean
  autoOpen: boolean
}
const modelValue = defineModel<WidgetConfig>({ required: true })
defineProps<{
  colors: string[]
}>()

</script>

<template>

  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <FormGroup label="Widget Color">
        <div class="flex gap-2">
          <button
            v-for="color in colors"
            :key="color"
            class="w-8 h-8 rounded-full border-2 transition-colors"
            :class="modelValue.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'"
            :style="{ backgroundColor: color }"
            @click="modelValue.color = color"
          />
        </div>
      </FormGroup>
      
      <FormGroup label="Position">
        <Select
          v-model="modelValue.position"
          :options="[
            { label: 'Bottom Right', value: 'bottom-right' },
            { label: 'Bottom Left', value: 'bottom-left' },
          ]"
        />
      </FormGroup>
    </div>
    
    <FormGroup label="Welcome Message">
      <Textarea v-model="modelValue.welcomeMessage" :rows="2" />
    </FormGroup>
    
    <Checkbox v-model="modelValue.showAvatar" label="Show agent avatar" />
    <Checkbox v-model="modelValue.autoOpen" label="Auto-open on page load" />
  </div>

</template>