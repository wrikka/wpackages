<script setup lang="ts">


interface Webhook {
  id: string
  name: string
  url: string
  secret?: string
  events: string[]
  isActive: boolean
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const webhooks = ref<Webhook[]>([])
const showCreate = ref(false)
const editing = ref(false)
const availableEvents = ['message.created', 'conversation.created', 'agent.updated', 'user.joined']
const form = ref<Partial<Webhook>>({
  name: '',
  url: '',
  secret: '',
  events: [],
  isActive: true,
})
const fetchWebhooks = async () => {
  webhooks.value = await $fetch<Webhook[]>('/api/webhooks')
}
const editHook = (hook: Webhook) => {
  form.value = { ...hook }
  editing.value = true
  showCreate.value = true
}
const saveWebhook = async () => {
  const method = editing.value ? 'PUT' : 'POST'
  await $fetch('/api/webhooks', { method, body: form.value })
  showCreate.value = false
  fetchWebhooks()
}
const deleteHook = async (id: string) => {
  await $fetch('/api/webhooks', { method: 'DELETE', query: { id } })
  fetchWebhooks()
}
onMounted(fetchWebhooks)

</script>

<template>

  <div class="webhooks-modal">
    <Modal v-model="isOpen" width="3xl">
      <Card>
        <template #header>
          <ModalHeader
            title="Webhooks"
            subtitle="Configure event-driven webhooks"
            button-text="Add Webhook"
            button-icon="plus"
            button-variant="primary"
            @button-click="showCreate = true"
          />
        
</template>