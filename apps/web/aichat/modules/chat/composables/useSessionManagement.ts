import { ref, computed } from 'vue'
import type { ChatSession } from '#shared/types/chat'

export function useSessionManagement() {
  const sessions = ref<ChatSession[]>([])
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentSession = computed(() => 
    sessions.value.find(session => session.id === currentSessionId.value)
  )

  const sortedSessions = computed(() => 
    [...sessions.value].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  async function fetchSessions() {
    isLoading.value = true
    try {
      sessions.value = await $fetch<ChatSession[]>('/api/sessions')
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function createSession(options: { model: string; agentId?: string | null }) {
    try {
      const newSession = await $fetch<ChatSession>('/api/sessions', {
        method: 'POST',
        body: options,
      })
      sessions.value.unshift(newSession)
      currentSessionId.value = newSession.id
      return newSession
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    }
  }

  async function updateSession(id: string, data: Partial<ChatSession>) {
    try {
      const updatedSession = await $fetch<ChatSession>(`/api/sessions/${id}`, {
        method: 'PUT',
        body: data,
      })
      
      const index = sessions.value.findIndex(session => session.id === id)
      if (index !== -1) {
        sessions.value[index] = updatedSession
      }
      
      return updatedSession
    } catch (error) {
      console.error('Failed to update session:', error)
      throw error
    }
  }

  async function deleteSession(id: string) {
    if (!confirm('Are you sure you want to delete this session?')) {
      return
    }

    try {
      await $fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      sessions.value = sessions.value.filter(session => session.id !== id)
      
      if (currentSessionId.value === id) {
        currentSessionId.value = null
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw error
    }
  }

  function setCurrentSession(id: string) {
    currentSessionId.value = id
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    sortedSessions,
    isLoading,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    setCurrentSession,
  }
}
