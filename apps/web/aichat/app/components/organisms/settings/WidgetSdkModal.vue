<script setup lang="ts">


interface WidgetConfig {
  color: string
  position: string
  welcomeMessage: string
  showAvatar: boolean
  autoOpen: boolean
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const widgetColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const config = ref<WidgetConfig>({
  color: '#3b82f6',
  position: 'bottom-right',
  welcomeMessage: 'Hi! How can I help you today?',
  showAvatar: true,
  autoOpen: false,
})
const embedCode = computed(() => {
  const endScript = '<' + '/script>'
  return `<!-- AI Chat Widget -->
<script src="${window.location.origin}/widget.js" defer></${'script'}>
<script>
  window.AIChatWidget = {
    apiKey: 'YOUR_API_KEY',
    config: ${JSON.stringify(config.value, null, 2)}
  };
</${'script'}>`
})
const copyCode = () => {
  navigator.clipboard.writeText(embedCode.value)
}

</script>

<template>

  <div class="widget-sdk-modal">
    <Modal v-model="isOpen" width="full">
      <Card>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">Chat Widget SDK</h3>
            <p class="text-sm text-gray-500">Embed the chat widget on your website</p>
          </div>
        
</template>