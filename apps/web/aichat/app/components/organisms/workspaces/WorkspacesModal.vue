<script setup lang="ts">


interface Workspace {
  id: string
  name: string
  description: string
  color: string
  icon?: string
  conversationCount?: number
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const workspaces = ref<Workspace[]>([])
const showCreate = ref(false)
const editing = ref(false)
const workspaceColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1']
const form = ref<Partial<Workspace>>({
  name: '',
  description: '',
  color: '#3b82f6',
})
const fetchWorkspaces = async () => {
  workspaces.value = await $fetch<Workspace[]>('/api/workspaces')
}
const editWorkspace = (ws: Workspace) => {
  form.value = { ...ws }
  editing.value = true
  showCreate.value = true
}
const saveWorkspace = async () => {
  const url = '/api/workspaces'
  const method = editing.value ? 'PUT' : 'POST'
  await $fetch(url, { method, body: form.value })
  showCreate.value = false
  fetchWorkspaces()
}
const deleteWorkspace = async (id: string) => {
  await $fetch(`/api/workspaces/${id}`, { method: 'DELETE' })
  fetchWorkspaces()
}
onMounted(fetchWorkspaces)

</script>

<template>

  <div class="workspaces-modal">
    <UModal v-model="isOpen" :ui="{ width: 'max-w-4xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Team Workspaces</h3>
              <p class="text-sm text-gray-500">Organize conversations by project or team</p>
            </div>
            <UButton color="primary" icon="i-heroicons-plus" @click="showCreate = true">
              New Workspace
            </UButton>
          </div>
        
</template>