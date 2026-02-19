<script setup lang="ts">


interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  isRevoked: boolean
  lastUsedAt?: Date
}
defineProps<{
  apiKey: ApiKey
}>()
defineEmits<{
  revoke: [id: string]
}>()
const formatDate = (date: Date) => new Date(date).toLocaleDateString()

</script>

<template>

  <div class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div>
      <div class="flex items-center gap-2">
        <h4 class="font-medium">{{ apiKey.name }}</h4>
        <Badge v-if="apiKey.isRevoked" variant="danger" size="xs">Revoked</Badge>
        <Badge v-else variant="success" size="xs">Active</Badge>
      </div>
      <p class="text-sm text-gray-500">{{ apiKey.keyPrefix }}...</p>
      <p v-if="apiKey.lastUsedAt" class="text-xs text-gray-400">
        Last used {{ formatDate(apiKey.lastUsedAt) }}
      </p>
    </div>
    <Button
      v-if="!apiKey.isRevoked"
      variant="ghost"
      size="xs"
      @click="$emit('revoke', apiKey.id)"
    >
      <Icon name="lucide:trash-2" class="w-4 h-4 text-red-500" />
    </Button>
  </div>

</template>