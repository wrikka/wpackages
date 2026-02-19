<script setup lang="ts">


interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  isRevoked: boolean
  lastUsedAt?: Date
}
interface NewKey {
  name: string
  permissions: string[]
  fullKey?: string
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const keys = ref<ApiKey[]>([])
const showCreate = ref(false)
const creating = ref(false)
const newKey = ref<NewKey>({ name: '', permissions: [], fullKey: '' })
const fetchKeys = async () => {
  const data = await $fetch<ApiKey[]>('/api/api-keys')
  keys.value = data
}
const createKey = async () => {
  if (newKey.value.fullKey) {
    showCreate.value = false
    newKey.value = { name: '', permissions: [], fullKey: '' }
    return
  }
  creating.value = true
  try {
    const result = await $fetch<ApiKey & { fullKey: string }>('/api/api-keys', {
      method: 'POST',
      body: {
        name: newKey.value.name,
        permissions: newKey.value.permissions,
      },
    })
    newKey.value.fullKey = result.fullKey
    fetchKeys()
  } finally {
    creating.value = false
  }
}
const revokeKey = async (id: string) => {
  await $fetch('/api/api-keys', { method: 'DELETE', query: { id } })
  fetchKeys()
}
onMounted(fetchKeys)

</script>

<template>

  <div class="api-keys-modal">
    <Modal v-model="isOpen" width="2xl">
      <Card>
        <template #header>
          <ModalHeader
            title="API Keys"
            subtitle="Manage your API keys for external access"
            button-text="New Key"
            button-icon="plus"
            button-variant="primary"
            @button-click="showCreate = true"
          />
        
</template>