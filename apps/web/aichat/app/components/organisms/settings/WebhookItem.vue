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
  webhook: Webhook
}>()
defineEmits<{
  edit: [webhook: Webhook]
  delete: [id: string]
}>()

</script>

<template>

  <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <h4 class="font-medium">{{ webhook.name }}</h4>
        <Badge :variant="webhook.isActive ? 'success' : 'gray'" size="xs">
          {{ webhook.isActive ? 'Active' : 'Inactive' }}
        </Badge>
      </div>
      <div class="flex gap-1">
        <Button variant="ghost" size="xs" @click="$emit('edit', webhook)">
          <Icon name="lucide:pencil" class="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="xs" @click="$emit('delete', webhook.id)">
          <Icon name="lucide:trash-2" class="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
    <p class="text-sm text-gray-500">{{ webhook.url }}</p>
    <div class="flex gap-1 mt-2">
      <Badge v-for="event in webhook.events" :key="event" size="xs" variant="primary">
        {{ event }}
      </Badge>
    </div>
  </div>

</template>