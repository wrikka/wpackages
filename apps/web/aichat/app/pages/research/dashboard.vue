<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const sessionsStore = useSessionsStore()
const messagesStore = useMessagesStore()
const kbStore = useKnowledgeBaseStore()
const user = useUser()

// Research sessions stats
const researchSessions = computed(() =>
  sessionsStore.sessions.filter(s => s.model === 'gpt-4')
)

const totalResearchSessions = computed(() => researchSessions.value.length)
const totalSources = computed(() => {
  let count = 0
  researchSessions.value.forEach(session => {
    const messages = messagesStore.allMessages.filter(m => m.chatSessionId === session.id)
    messages.forEach(msg => {
      if (msg.role === 'assistant' && typeof msg.content === 'string') {
        const sources = extractSources(msg.content)
        count += sources.length
      }
    })
  })
  return count
})

const recentResearchSessions = computed(() => 
  [...researchSessions.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
)

function extractSources(text: string): { title: string, url: string }[] {
  const idx = text.toLowerCase().lastIndexOf('sources:')
  if (idx === -1) return []
  const section = text.slice(idx)
  const lines = section.split('\n').map(l => l.trim())
  const links: { title: string, url: string }[] = []
  for (const line of lines) {
    if (!line.startsWith('-')) continue
    const m = line.match(/^-\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/)
    if (m && m[2]) {
      const url = String(m[2])
      const title = String((m[1] ?? '').trim() || url)
      links.push({ title, url })
    }
  }
  return links
}

function goToSession(sessionId: string) {
  navigateTo(`/chat?session=${sessionId}`)
}

onMounted(async () => {
  await chatStore.fetchSessions()
  await kbStore.fetchKnowledgeBases()
})

</script>

<template>

  <div class="p-4 md:p-8">
    <div class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold mb-2">Research Dashboard</h1>
      <p class="text-gray-600">Overview of your research activities</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      <Card>
        <div class="p-6">
          <div class="text-sm text-gray-500 mb-1">Total Research Sessions</div>
          <div class="text-3xl font-bold text-primary-600">{{ totalResearchSessions }}</div>
        </div>
      </Card>
      <Card>
        <div class="p-6">
          <div class="text-sm text-gray-500 mb-1">Total Sources</div>
          <div class="text-3xl font-bold text-success-600">{{ totalSources }}</div>
        </div>
      </Card>
      <Card>
        <div class="p-6">
          <div class="text-sm text-gray-500 mb-1">Knowledge Bases</div>
          <div class="text-3xl font-bold text-warning-600">{{ kbStore.knowledgeBases.length }}</div>
        </div>
      </Card>
    </div>

    <!-- Recent Research Sessions -->
    <div class="mb-8">
      <h2 class="text-xl font-bold mb-4">Recent Research Sessions</h2>
      <div v-if="recentResearchSessions.length === 0" class="card p-8 text-center text-gray-500">
        <p>No research sessions yet. Start your first research!</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="session in recentResearchSessions"
          :key="session.id"
          class="cursor-pointer"
          @click="goToSession(session.id)"
        >
          <Card hover clickable class="p-4">
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg truncate">{{ session.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ new Date(session.updatedAt).toLocaleString() }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <span class="badge bg-primary-100 text-primary-800">Research</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div>
      <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink to="/research">
          <Card hover clickable class="p-6 text-center">
            <div class="text-4xl mb-2">🔍</div>
            <div class="font-bold mb-1">New Research</div>
            <div class="text-sm text-gray-500">Start a new research session</div>
          </Card>
        </NuxtLink>
        <NuxtLink to="/knowledge-bases">
          <Card hover clickable class="p-6 text-center">
            <div class="text-4xl mb-2">📚</div>
            <div class="font-bold mb-1">Knowledge Bases</div>
            <div class="text-sm text-gray-500">Manage your knowledge bases</div>
          </Card>
        </NuxtLink>
        <NuxtLink to="/chat">
          <Card hover clickable class="p-6 text-center">
            <div class="text-4xl mb-2">💬</div>
            <div class="font-bold mb-1">Chat</div>
            <div class="text-sm text-gray-500">Start a regular chat session</div>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </div>

</template>