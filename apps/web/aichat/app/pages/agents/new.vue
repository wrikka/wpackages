<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const agent = ref({
  name: '',
  description: '',
  systemPrompt: '',
})

async function saveAgent() {
  if (!agent.value.name.trim()) return

  const newAgent = await $fetch('/api/agents', {
    method: 'POST',
    body: agent.value,
  })

  await router.push(`/agents/${newAgent.id}`)
}

</script>

<template>

  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Create New Agent</h1>
    <form @submit.prevent="saveAgent" class="space-y-4 max-w-xl">
      <div>
        <label class="block font-medium">Name</label>
        <input v-model="agent.name" type="text" class="input w-full" required />
      </div>
      <div>
        <label class="block font-medium">Description</label>
        <textarea v-model="agent.description" class="textarea w-full"></textarea>
      </div>
      <div>
        <label class="block font-medium">System Prompt</label>
        <textarea v-model="agent.systemPrompt" class="textarea w-full" rows="10"></textarea>
      </div>
      <div class="flex justify-end gap-2">
        <NuxtLink to="/agents" class="btn-secondary">Cancel</NuxtLink>
        <button type="submit" class="btn-primary">Create</button>
      </div>
    </form>
  </div>

</template>