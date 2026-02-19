<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: organizations, refresh } = await useFetch('/api/organizations')
const isCreateModalOpen = ref(false)
const newOrgName = ref('')

async function createOrganization() {
  if (!newOrgName.value.trim()) return
  await $fetch('/api/organizations', {
    method: 'POST',
    body: { name: newOrgName.value },
  })
  isCreateModalOpen.value = false
  newOrgName.value = ''
  await refresh()
}

</script>

<template>

  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Organizations</h1>
      <button class="btn-primary" @click="isCreateModalOpen = true">Create New</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="org in organizations"
        :key="org.id"
        :to="`/organizations/${org.id}`"
        class="block p-4 border rounded-lg hover:bg-gray-50"
      >
        <h2 class="font-bold text-lg">{{ org.name }}</h2>
      </NuxtLink>
    </div>

    <!-- Create Modal -->
    <UModal v-model="isCreateModalOpen">
      <div class="p-4">
        <h2 class="text-lg font-bold mb-4">Create Organization</h2>
        <form @submit.prevent="createOrganization" class="space-y-4">
          <input v-model="newOrgName" type="text" placeholder="Organization Name" class="input w-full" required />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" @click="isCreateModalOpen = false">Cancel</button>
            <button type="submit" class="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </UModal>
  </div>

</template>