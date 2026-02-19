<script setup lang="ts">


interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  isRevoked: boolean
  lastUsedAt?: Date
}
defineProps<{
  keys: ApiKey[]
}>()
defineEmits<{
  revoke: [id: string]
}>()

</script>

<template>

  <div class="space-y-4">
    <EmptyState
      v-if="keys.length === 0"
      icon="key"
      message="No API keys created yet"
    />
    
    <div v-else class="space-y-3">
      <ApiKeyItem
        v-for="key in keys"
        :key="key.id"
        :api-key="key"
        @revoke="$emit('revoke', $event)"
      />
    </div>
  </div>

</template>