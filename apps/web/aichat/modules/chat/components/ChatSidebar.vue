<script setup lang="ts">

import type { ChatSession } from '#shared/types/chat'
import draggable from 'vuedraggable'
import SessionItem from './SessionItem.vue'
import FolderItem from './FolderItem.vue'
import { usePluginsStore } from '~/stores/plugins'
import PluginFrameHost from './plugins/PluginFrameHost.vue'

defineProps<{
  sessions: ChatSession[]
  currentSessionId: string | null
  isOpen: boolean
}>()
type ModelProvider = { provider: string; group: string; models: { id: string; name: string }[] };
const emit = defineEmits<{
  select: [sessionId: string]
  create: [options: { provider: string, model: string, agentId: string | null }]
  delete: [sessionId: string]
  import: []
}>()
const sessionsStore = useSessionsStore()
const foldersStore = useFoldersStore()
const orgStore = useOrganizationStore()
const agentStore = useAgentStore()
const chatStore = useChatStore()
const pluginsStore = usePluginsStore()
const toast = useToast()
const newFolderName = ref('');
const sortedSessions = computed(() => {
  return [...props.sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Assuming updatedAt is a string that can be parsed into a Date
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
});
async function createNewFolder() {
  if (newFolderName.value.trim()) {
    await foldersStore.createFolder(newFolderName.value.trim())
    newFolderName.value = ''
  }
}
function onDragEnd(event: any) {
  const { item, to } = event
  const sessionId = item.dataset.sessionId
  const folderId = to.dataset.folderId || null
  if (sessionId) {
    sessionsStore.moveSessionToFolder(sessionId, folderId)
  }
}
const availableProviders = ref<ModelProvider[]>([]);
const selectedProviderId = ref('');
const selectedModelId = ref('');
const availableModelsForSelectedProvider = computed(() => {
  const provider = availableProviders.value.find(p => p.provider === selectedProviderId.value);
  return provider ? provider.models : [];
});
watch(selectedProviderId, (newProviderId) => {
  const provider = availableProviders.value.find(p => p.provider === newProviderId);
  if (provider && provider.models.length > 0) {
    selectedModelId.value = provider.models[0].id;
  }
});
const selectedAgentId = ref<string>('')
onMounted(async () => {
  agentStore.fetchAgents();
  availableProviders.value = await $fetch<ModelProvider[]>('/api/ai/models');
  if (availableProviders.value.length > 0) {
    selectedProviderId.value = availableProviders.value[0].provider;
  }
  pluginsStore.fetchPlugins();
});
const sidebarSectionPlugins = computed(() => {
  return pluginsStore.plugins.filter((p) => {
    const permissions = Array.isArray(p.manifest?.permissions) ? p.manifest.permissions : []
    return p.enabled && permissions.includes('ui:sidebar_section')
  })
})
const getAllowedSidebarPluginMethods = (plugin: any): Array<'setDraft' | 'toast'> => {
  const permissions = Array.isArray(plugin?.manifest?.permissions) ? plugin.manifest.permissions : []
  const allowed: Array<'setDraft' | 'toast'> = []
  if (permissions.includes('ui:sidebar_section')) {
    allowed.push('toast')
  }
  return allowed
}

</script>

<template>

  <div
    class="border-r border-gray-200 bg-gray-50 flex flex-col transition-transform transform absolute md:static inset-y-0 left-0 z-30 w-64"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <div class="p-4 border-b border-gray-200">
      <select
        :value="orgStore.currentOrganizationId"
        @change="orgStore.setCurrentOrganization(($event.target as HTMLSelectElement).value)"
        class="input w-full"
      >
        <option v-for="org in orgStore.organizations" :key="org.id" :value="org.id">
          {{ org.name }}
        </option>
      </select>
      <NuxtLink to="/organizations" class="text-sm text-primary-600 mt-2 block">Manage Organizations</NuxtLink>
    </div>

    <div v-if="sidebarSectionPlugins.length > 0" class="p-4 border-b border-gray-200 space-y-2">
      <div class="text-xs font-bold text-gray-500">Plugins</div>
      <div class="flex flex-wrap gap-2">
        <PluginFrameHost
          v-for="p in sidebarSectionPlugins"
          :key="p.id"
          :plugin-id="p.id"
          :src="p.entryUrl"
          :title="p.name"
          :allowed-methods="getAllowedSidebarPluginMethods(p)"
          @toast="(payload) => toast.add(payload)"
        />
      </div>
    </div>
    <div class="p-4 border-b border-gray-200 space-y-4">
      <div class="flex flex-col space-y-2">
                <select v-model="selectedAgentId" class="input">
          <option value="">Default (No Agent)</option>
          <option v-for="agent in agentStore.agents" :key="agent.id" :value="agent.id">
            {{ agent.name }}
          </option>
        </select>
        <select v-model="selectedProviderId" class="input">
          <option v-for="provider in availableProviders" :key="provider.provider" :value="provider.provider">
            {{ provider.group }}
          </option>
        </select>
        <select v-model="selectedModelId" class="input" :disabled="!selectedProviderId">
          <option v-for="model in availableModelsForSelectedProvider" :key="model.id" :value="model.id">
            {{ model.name }}
          </option>
        </select>
        <button
          class="btn-primary w-full"
          @click="emit('create', { provider: selectedProviderId, model: selectedModelId, agentId: selectedAgentId || null })"
        >
          New Chat
        </button>
      </div>
      <input v-model="chatStore.searchTerm" type="text" placeholder="Search messages..." class="input" />
      <div v-if="chatStore.searchTerm.length > 2 && chatStore.messageSearchResults.length > 0" class="mt-4">
        <h3 class="font-bold text-sm mb-2">Search Results</h3>
        <div class="max-h-48 overflow-y-auto">
          <div v-for="message in chatStore.messageSearchResults" :key="message.id" class="p-2 border-b text-sm cursor-pointer hover:bg-gray-100" @click="emit('select', message.chatSessionId)">
            <p class="font-bold">{{ message.chatSession?.title || message.chatSessionId }}</p>
            <p class="truncate text-gray-600">{{ message.content }}</p>
          </div>
        </div>
      </div>
      <button class="btn-secondary w-full" @click="emit('import')">Import Chat</button>
    </div>

    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <input v-model="newFolderName" type="text" placeholder="New folder name..." class="input flex-1" @keyup.enter="createNewFolder" />
        <button @click="createNewFolder" class="btn-primary">Create</button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <!-- Folders -->
            <!-- Folders -->
      <div v-for="folder in chatStore.folders" :key="folder.id">
        <FolderItem :folder="folder" />
        <draggable :list="chatStore.sessionsByFolder[folder.id]" group="sessions" item-key="id" :data-folder-id="folder.id" @end="onDragEnd">
          <template #item="{ element: session }">
            <div :data-session-id="session.id" :class="{ 'bg-gray-200': session.id === currentSessionId }" @click="emit('select', session.id)">
              <SessionItem :session="session" @delete="emit('delete', session.id)" />
            </div>
          
</template>