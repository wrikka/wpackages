<script setup lang="ts">


defineProps<{
  modelValue: string
}>()
defineEmits<{
  'update:modelValue': [value: string]
}>()

</script>

<template>

  <div class="flex gap-1">
    <Button
      v-for="range in ['7d', '30d', '90d']"
      :key="range"
      size="xs"
      :variant="modelValue === range ? 'primary' : 'secondary'"
      @click="$emit('update:modelValue', range)"
    >
      {{ range }}
    </Button>
  </div>

</template>