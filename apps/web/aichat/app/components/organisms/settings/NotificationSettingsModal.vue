<script setup lang="ts">


interface NotificationSettings {
  browser: boolean
  email: boolean
  emailDigest: boolean
  emailMentions: boolean
  emailUpdates: boolean
  push: boolean
  onMessage: boolean
  onAgentComplete: boolean
  onScheduledMessage: boolean
  onMention: boolean
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const settings = ref<NotificationSettings>({
  browser: false,
  email: false,
  emailDigest: true,
  emailMentions: true,
  emailUpdates: false,
  push: false,
  onMessage: true,
  onAgentComplete: true,
  onScheduledMessage: true,
  onMention: true,
})
const requestNotificationPermission = async () => {
  if (!settings.value.browser) return
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      settings.value.browser = false
      alert('Please allow notification permission in browser settings')
    }
  }
}
const saveSettings = async () => {
  await $fetch('/api/notifications/settings', {
    method: 'PUT',
    body: settings.value,
  })
  isOpen.value = false
}
onMounted(async () => {
  const saved = await $fetch<NotificationSettings>('/api/notifications/settings')
  if (saved) settings.value = saved
})

</script>

<template>

  <div class="notification-settings-modal">
    <Modal v-model="isOpen" width="2xl">
      <Card>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">Notification Settings</h3>
            <p class="text-sm text-gray-500">Configure how you receive notifications</p>
          </div>
        
</template>