<script setup lang="ts">

import PromptHistoryModal from '~/app/components/PromptHistoryModal.vue';
import AgentToolsManager from '~/app/components/organisms/settings/AgentToolsManager.vue';
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const agentId = route.params.id as string

const agentStore = useAgentStore()
const isEditing = ref(false)
const name = ref('')
const description = ref('')
const systemPrompt = ref('')
const isHistoryModalOpen = ref(false)

const { data: agent, refresh } = await useFetch<import('#shared/types/chat').Agent>(`/api/agents/${agentId}`)

onMounted(() => {
  if (agent.value) {
    name.value = agent.value.name
    description.value = agent.value.description || ''
    systemPrompt.value = agent.value.systemPrompt || ''
  }
})

async function saveAgent() {
  if (!name.value.trim()) return
  await $fetch(`/api/agents/${agentId}`, {
    method: 'PUT',
    body: {
      name: name.value,
      description: description.value,
      systemPrompt: systemPrompt.value,
    },
  })
  isEditing.value = false
  await refresh()
}

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  if (agent.value) {
    name.value = agent.value.name
    description.value = agent.value.description || ''
    systemPrompt.value = agent.value.systemPrompt || ''
  }
}

async function deleteAgent() {
  if (confirm('Are you sure you want to delete this agent?')) {
    await agentStore.deleteAgent(agentId)
    await navigateTo('/agents')
  }
}

function testAgent() {
  navigateTo(`/agents?agentId=${agentId}`)
}

function handleRestorePrompt(prompt: string) {
  systemPrompt.value = prompt;
  isEditing.value = true; // Switch to edit mode to allow saving the restored prompt
}

</script>

<template>

  <div v-if="agent" class="p-8">
    <div class="flex justify-between items-center mb-6">
      <NuxtLink to="/agents" class="text-sm text-primary-600 mb-4 block">&larr; Back to agents</NuxtLink>
      <div class="flex gap-2">
        <button v-if="!isEditing" @click="startEditing" class="btn-primary">Edit</button>
        <button v-if="!isEditing" @click="testAgent" class="btn-secondary">Test Agent</button>
        <button v-if="!isEditing" @click="deleteAgent" class="btn-secondary text-red-600 hover:text-red-700">Delete</button>
      </div>
    </div>

    <div v-if="isEditing" class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-1">Name *</label>
        <input v-model="name" type="text" class="input w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Description</label>
        <textarea v-model="description" class="textarea w-full" rows="3"></textarea>
      </div>
      <div>
                <div class="flex justify-between items-center">
          <label class="block text-sm font-medium mb-1">System Prompt</label>
          <UButton variant="link" @click="isHistoryModalOpen = true">History</UButton>
        </div>
        <textarea v-model="systemPrompt" class="textarea w-full" rows="10"></textarea>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="cancelEditing" class="btn-secondary">Cancel</button>
        <button @click="saveAgent" class="btn-primary">Save</button>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">{{ agent.name }}</h1>
        <p class="text-gray-600 mt-2">{{ agent.description || 'No description' }}</p>
      </div>

      <div v-if="agent.systemPrompt">
        <h2 class="text-lg font-semibold mb-2">System Prompt</h2>
        <div class="bg-gray-50 p-4 rounded-lg">
          <pre class="whitespace-pre-wrap text-sm">{{ agent.systemPrompt }}</pre>
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-2">Metadata</h2>
                  <div class="bg-gray-50 p-4 rounded-lg space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Created:</span>
              <span>{{ new Date(agent.createdAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <AgentToolsManager :agent-id="agentId" />
    </div>

    <PromptHistoryModal 
      v-model="isHistoryModalOpen" 
      :agent-id="agentId" 
      @restore="handleRestorePrompt" 
    />
  </div>

</template>