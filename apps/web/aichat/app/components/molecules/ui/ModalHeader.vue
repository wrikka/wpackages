<script setup lang="ts">


defineProps<{
  title: string
  subtitle?: string
  buttonText?: string
  buttonVariant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  buttonIcon?: string
}>()
defineEmits<{
  'button-click': []
}>()

</script>

<template>

  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p class="text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    <Button :variant="buttonVariant" @click="$emit('button-click')">
      <Icon v-if="buttonIcon" :name="buttonIcon" class="mr-1 w-4 h-4" />
      {{ buttonText }}
    </Button>
  </div>

</template>