<script setup lang="ts">


defineProps<{
  cancelText?: string
  confirmText?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
}>()
defineEmits<{
  cancel: []
  confirm: []
}>()

</script>

<template>

  <div class="flex justify-end gap-2">
    <Button variant="secondary" @click="$emit('cancel')">
      {{ cancelText }}
    </Button>
    <Button
      :variant="confirmVariant"
      :loading="loading"
      :disabled="disabled"
      @click="$emit('confirm')"
    >
      {{ confirmText }}
    </Button>
  </div>

</template>