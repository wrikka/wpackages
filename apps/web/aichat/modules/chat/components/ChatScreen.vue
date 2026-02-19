<script setup lang="ts">

import type { ChatMode, ChatScreenMode } from '#shared/types/common'

type Props = {
  initialMode: ChatScreenMode
}
const props = defineProps<Props>()
import ChatHeader from '../molecules/ChatHeader.vue';
import ChatSidebar from '../organisms/ChatSidebar.vue';
import ChatMain from './ChatMain.vue';
import ChatActions from '../molecules/ChatActions.vue';
import ChatModals from '../molecules/ChatModals.vue';
import ContextSidebar from '../ContextSidebar.vue';
const user = useUser()
const sessionsStore = useSessionsStore()
const chatUIStore = useChatUIStore()
const kbStore = useKnowledgeBaseStore()

// Context sidebar state
const isContextSidebarOpen = ref(false)
const contextSources = ref<Array<{
  id: string
  title: string
  content: string
  type: 'document' | 'web' | 'knowledge' | 'code' | 'conversation'
  url?: string
  relevance: number
  timestamp: Date
}>>([])
const currentMessageId = ref<string | null>(null)
const isStreaming = ref(false)

// Component refs
const chatHeaderRef = ref()
const chatMainRef = ref()
const chatActionsRef = ref()
const chatModalsRef = ref()

// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'b',
    ctrlKey: true,
    handler: () => chatUIStore.toggleSidebar(),
    description: 'Toggle sidebar',
  },
  {
    key: 'r',
    ctrlKey: true,
    handler: () => {
      isContextSidebarOpen.value = !isContextSidebarOpen.value
    },
    description: 'Toggle context sidebar',
  },
  {
    key: 'k',
    ctrlKey: true,
    handler: () => {
      const header = chatHeaderRef.value
      if (header && 'searchQuery' in header) {
        header.searchQuery = ''
      }
    },
    description: 'Clear search',
  },
  {
    key: 'n',
    ctrlKey: true,
    handler: async () => {
      await handleCreateSession({ model: selectedModel.value, agentId: null })
    },
    description: 'New chat',
  },
])

const selectedModel = ref('gpt-4')

async function handleCreateSession(options: { model: string; agentId: string | null }) {
  await sessionsStore.createSession(options)
}

function handleSourceClick(source: any) {
  // TO DO: implement handleSourceClick
}

</script>

<template>

  <div class="chat-screen">
    <!-- Header -->
    <ChatHeader ref="chatHeaderRef" />
    
    <!-- Main content -->
    <div class="chat-content">
      <!-- Sidebar -->
      <ChatSidebar
        v-if="chatUIStore.isSidebarOpen"
        :sessions="sessionsStore.sessions"
        :current-session-id="sessionsStore.currentSession?.id"
        :is-open="chatUIStore.isSidebarOpen"
        @select="sessionsStore.setCurrentSession"
        @create="handleCreateSession"
        @delete="sessionsStore.deleteSession"
      />
      
      <!-- Main chat area -->
      <ChatMain
        ref="chatMainRef"
        :initial-mode="props.initialMode"
      />
      
      <!-- Right panel -->
      <div
        v-if="chatUIStore.isRightPanelOpen"
        class="right-panel"
      >
        <!-- Knowledge base, agents, etc. -->
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-4">Context</h3>
          
          <!-- Knowledge Base -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Knowledge Base</h4>
            <select
              v-if="sessionsStore.currentSession"
              :value="sessionsStore.currentSession.knowledgeBaseId"
              @change="sessionsStore.setSessionKnowledgeBase(sessionsStore.currentSession.id, ($event.target as HTMLSelectElement).value || null)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Knowledge Base</option>
              <option v-for="kb in kbStore.knowledgeBases" :key="kb.id" :value="kb.id">
                {{ kb.name }}
              </option>
            </select>
            <div v-else class="text-sm text-gray-500">Select or create a chat session.</div>
          </div>

          <!-- Mode -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Mode</h4>
            <div class="text-sm text-gray-800">{{ props.initialMode }}</div>
          </div>

          <!-- Model -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Model</h4>
            <div class="text-sm text-gray-800">{{ selectedModel }}</div>
          </div>
        </div>
      </div>
      
      <!-- Context Sidebar -->
      <ContextSidebar
        :is-open="isContextSidebarOpen"
        :message-id="currentMessageId"
        :sources="contextSources"
        :is-streaming="isStreaming"
        @close="isContextSidebarOpen = false"
        @source-click="handleSourceClick"
      />
    </div>
    
    <!-- Actions -->
    <ChatActions ref="chatActionsRef" />
    
    <!-- Modals -->
    <ChatModals ref="chatModalsRef" />
  </div>

</template>

<style scoped>

.chat-screen {
  @apply flex flex-col h-full;
}

.chat-content {
  @apply flex flex-1 overflow-hidden;
}

.right-panel {
  @apply w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900;
}

</style>