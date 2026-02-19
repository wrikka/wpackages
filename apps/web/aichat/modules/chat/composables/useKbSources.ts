import { ref } from 'vue'
import type { KnowledgeBaseSource } from '#shared/types/chat'

export function useKbSources(kbId: string) {
  const sources = ref<KnowledgeBaseSource[]>([])
  const isLoading = ref(false)
  const newSourceType = ref<'url' | 'file'>('url')
  const newSourceUri = ref('')

  async function fetchSources() {
    isLoading.value = true
    try {
      sources.value = await $fetch(`/api/knowledge-bases/${kbId}/sources`)
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function addSource() {
    if (!newSourceUri.value.trim()) return

    await $fetch(`/api/knowledge-bases/${kbId}/sources`, {
      method: 'POST',
      body: { type: newSourceType.value, uri: newSourceUri.value },
    })
    newSourceUri.value = ''
    await fetchSources()
  }

  async function deleteSource(sourceId: string) {
    if (confirm('Are you sure you want to delete this source?')) {
      await $fetch(`/api/knowledge-bases/${kbId}/sources/${sourceId}`, {
        method: 'DELETE',
      })
      await fetchSources()
    }
  }

  return {
    sources,
    isLoading,
    newSourceType,
    newSourceUri,
    fetchSources,
    addSource,
    deleteSource,
  }
}
