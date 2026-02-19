<script setup lang="ts">


defineProps<{
  modelValue: string
  categories: string[]
}>()
defineEmits<{
  'update:modelValue': [value: string]
}>()

</script>

<template>

  <div class="flex gap-2 flex-wrap">
    <Button
      v-for="cat in categories"
      :key="cat"
      size="xs"
      :variant="modelValue === cat ? 'primary' : 'secondary'"
      @click="$emit('update:modelValue', cat)"
    >
      {{ cat }}
    </Button>
  </div>

</template>