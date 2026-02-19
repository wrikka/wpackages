<script setup lang="ts">


interface Props {
  conversationId: string
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<['update:modelValue']>()
const scheduledStore = useScheduledMessagesStore()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
const content = ref('')
const dateInput = ref('')
const timeInput = ref('')
const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}
const scheduleMessage = async () => {
  if (!dateInput.value || !timeInput.value) return
  const scheduledAt = new Date(`${dateInput.value}T${timeInput.value}`)
  await scheduledStore.scheduleMessage({
    conversationId: props.conversationId,
    content: content.value,
    scheduledAt: scheduledAt.toISOString(),
  })
  content.value = ''
  dateInput.value = ''
  timeInput.value = ''
  isOpen.value = false
}
onMounted(() => {
  scheduledStore.fetchScheduledMessages()
})

</script>

<template>

  <div class="scheduled-message-modal">
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Schedule Message</h3>
        
</template>