<script setup lang="ts">


interface Integration {
  id: string
  name: string
  description: string
  icon: string
  color: string
  connected: boolean
}
const exportFormats = [
  { label: 'Markdown', value: 'md', icon: 'i-heroicons-document-text' },
  { label: 'PDF', value: 'pdf', icon: 'i-heroicons-document' },
  { label: 'JSON', value: 'json', icon: 'i-heroicons-code-bracket' },
  { label: 'HTML', value: 'html', icon: 'i-heroicons-globe-alt' }
]
const previewFormat = ref('md')
const integrations = ref<Integration[]>([
  { id: '1', name: 'Slack', description: 'Send to Slack channel', icon: 'i-simple-icons-slack', color: '#4A154B', connected: false },
  { id: '2', name: 'Notion', description: 'Export to Notion page', icon: 'i-simple-icons-notion', color: '#000000', connected: true },
  { id: '3', name: 'Obsidian', description: 'Save to Obsidian vault', icon: 'i-heroicons-book-open', color: '#7C3AED', connected: false },
  { id: '4', name: 'GitHub', description: 'Create GitHub issue', icon: 'i-simple-icons-github', color: '#181717', connected: false }
])
const exportPreview = computed(() => {
  const previews: Record<string, string> = {
    md: `# AI Chat Export
**Date:** ${new Date().toLocaleDateString()}
## Conversation
**User:** How do I implement authentication in Nuxt?
**AI:** Here's how to implement authentication in Nuxt 3 using Lucia...`,
    json: JSON.stringify({
      title: 'AI Chat Export',
      date: new Date().toISOString(),
      messages: [
        { role: 'user', content: 'How do I implement authentication in Nuxt?' },
        { role: 'assistant', content: 'Here\'s how to implement authentication...' }
      ]
    }, null, 2),
    html: `<!DOCTYPE html>
<html>
<head><title>Chat Export</title></head>
<body>
  <h1>AI Chat Export</h1>
  <div class="message user">How do I implement authentication?</div>
  <div class="message assistant">Here's how to implement...</div>
</body>
</html>`,
    pdf: '[PDF Preview - Binary content]'
  }
  return previews[previewFormat.value] || previews.md
})
const exportChat = (format: string) => {
  previewFormat.value = format
  // Trigger export logic
}
const toggleIntegration = (integration: Integration) => {
  if (!integration.connected) {
    // Open OAuth/connect flow
  }
  integration.connected = !integration.connected
}
const copyToClipboard = () => {
  navigator.clipboard.writeText(exportPreview.value)
}
const shareDirectly = () => {
  // Share via Web Share API
}
const emailExport = () => {
  // Open email compose
}

</script>

<template>

  <div class="export-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-arrow-up-tray" class="text-primary" />
        Export & Integrations
      </h3>
    </div>

    <div class="panel-content space-y-4">
      <!-- Export Formats -->
      <div class="export-section">
        <p class="text-sm font-medium mb-2">Export as</p>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            v-for="format in exportFormats"
            :key="format.value"
            size="sm"
            color="gray"
            variant="soft"
            :icon="format.icon"
            @click="exportChat(format.value)"
          >
            {{ format.label }}
          </UButton>
        </div>
      </div>

      <!-- Integrations -->
      <div class="integrations-section">
        <p class="text-sm font-medium mb-2">Integrations</p>
        <div class="space-y-2">
          <div
            v-for="integration in integrations"
            :key="integration.id"
            class="integration-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="integration-icon w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: integration.color }">
                <UIcon :name="integration.icon" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="font-medium text-sm">{{ integration.name }}</p>
                <p class="text-xs text-gray-500">{{ integration.description }}</p>
              </div>
            </div>
            <UButton
              size="xs"
              :color="integration.connected ? 'green' : 'primary'"
              :variant="integration.connected ? 'soft' : 'solid'"
              @click="toggleIntegration(integration)"
            >
              {{ integration.connected ? 'Connected' : 'Connect' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Export Preview -->
      <div class="export-preview">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-medium">Export Preview</p>
          <USelect v-model="previewFormat" :options="exportFormats" size="xs" />
        </div>
        <div class="preview-box p-3 bg-gray-900 rounded-lg text-sm font-mono text-gray-300 max-h-40 overflow-y-auto">
          <pre>{{ exportPreview }}</pre>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions flex gap-2">
        <UButton size="sm" color="primary" icon="i-heroicons-clipboard" @click="copyToClipboard">
          Copy
        </UButton>
        <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-share" @click="shareDirectly">
          Share
        </UButton>
        <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-envelope" @click="emailExport">
          Email
        </UButton>
      </div>
    </div>
  </div>

</template>

<style scoped>

.export-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>