<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: knowledgeBases, refresh } = await useFetch('/api/knowledge-bases')
const isCreateModalOpen = ref(false)
const newKbName = ref('')
const newKbDescription = ref('')
const searchTerm = ref('')

const filteredKnowledgeBases = computed(() => {
  if (!searchTerm.value) {
    return knowledgeBases.value || []
  }
  const q = searchTerm.value.toLowerCase()
  return (knowledgeBases.value || []).filter(kb =>
    kb.name.toLowerCase().includes(q) || (kb.description && kb.description.toLowerCase().includes(q))
  )
})

async function createKnowledgeBase() {
  if (!newKbName.value.trim()) return
  await $fetch('/api/knowledge-bases', {
    method: 'POST',
    body: {
      name: newKbName.value,
      description: newKbDescription.value,
    },
  })
  isCreateModalOpen.value = false
  newKbName.value = ''
  newKbDescription.value = ''
  await refresh()
}

</script>

<template>

  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Knowledge Bases</h1>
      <button class="btn-primary" @click="isCreateModalOpen = true">Create New</button>
    </div>

    <div class="mb-6">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search knowledge bases..."
        class="input w-full"
      />
    </div>

    <div v-if="filteredKnowledgeBases.length === 0" class="text-center py-8 text-gray-500">
      <p v-if="searchTerm">No knowledge bases found matching "{{ searchTerm }}"</p>
      <p v-else>No knowledge bases yet. Create your first knowledge base to get started!</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="kb in filteredKnowledgeBases"
        :key="kb.id"
        :to="`/knowledge-bases/${kb.id}`"
        class="block p-4 border rounded-lg hover:bg-gray-50"
      >
        <h2 class="font-bold text-lg">{{ kb.name }}</h2>
        <p class="text-sm text-gray-600">{{ kb.description || 'No description' }}</p>
      </NuxtLink>
    </div>

    <!-- Create Modal -->
    <UModal v-model="isCreateModalOpen">
      <div class="p-4">
        <h2 class="text-lg font-bold mb-4">Create Knowledge Base</h2>
        <form @submit.prevent="createKnowledgeBase" class="space-y-4">
          <input v-model="newKbName" type="text" placeholder="Name" class="input w-full" required />
          <textarea v-model="newKbDescription" placeholder="Description (optional)" class="textarea w-full"></textarea>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" @click="isCreateModalOpen = false">Cancel</button>
            <button type="submit" class="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </UModal>
  </div>

</template>