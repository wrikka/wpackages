<script setup lang="ts">


interface ImageOptions {
  size: string
  quality: string
  style: string
}
const modelValue = defineModel<ImageOptions>({ required: true })

</script>

<template>

  <div class="grid grid-cols-2 gap-4">
    <FormGroup label="Size">
      <Select v-model="modelValue.size" :options="['1024x1024', '1024x1792', '1792x1024']" />
    </FormGroup>
    
    <FormGroup label="Quality">
      <Select
        v-model="modelValue.quality"
        :options="[
          { label: 'Standard', value: 'standard' },
          { label: 'HD', value: 'hd' }
        ]"
      />
    </FormGroup>
  </div>
  
  <FormGroup label="Style">
    <div class="flex gap-2">
      <Button
        v-for="style in ['vivid', 'natural']"
        :key="style"
        size="sm"
        :variant="modelValue.style === style ? 'primary' : 'secondary'"
        @click="modelValue.style = style"
      >
        {{ style.charAt(0).toUpperCase() + style.slice(1) }}
      </Button>
    </div>
  </FormGroup>

</template>