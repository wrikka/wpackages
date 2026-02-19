<script setup lang="ts">


interface Webhook {
  id: string
  name: string
  url: string
  secret?: string
  events: string[]
  isActive: boolean
}
defineProps<{
  webhooks: Webhook[]
}>()
defineEmits<{
  edit: [webhook: Webhook]
  delete: [id: string]
}>()

</script>

<template>

  <div class="space-y-4">
    <EmptyState
      v-if="webhooks.length === 0"
      icon="bell"
      message="No webhooks configured"
    />
    
    <div v-else class="space-y-3">
      <WebhookItem
        v-for="hook in webhooks"
        :key="hook.id"
        :webhook="hook"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>

</template>