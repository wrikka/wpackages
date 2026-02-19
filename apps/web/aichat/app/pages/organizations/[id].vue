<script setup lang="ts">

const route = useRoute()
const orgId = route.params.id as string

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: organization, refresh } = await useFetch<import('#shared/types/chat').Organization>(`/api/organizations/${orgId}`)

const inviteEmail = ref('')
const inviteRole = ref('member')

async function inviteMember() {
  if (!inviteEmail.value.trim()) return
  await $fetch(`/api/organizations/${orgId}/members`, {
    method: 'POST',
    body: {
      email: inviteEmail.value,
      role: inviteRole.value,
    },
  })
  inviteEmail.value = ''
  await refresh()
}

async function removeMember(memberId: string) {
  if (confirm('Are you sure you want to remove this member?')) {
    await $fetch(`/api/organizations/${orgId}/members/${memberId}`, {
      method: 'DELETE',
    })
    await refresh()
  }
}

</script>

<template>

  <div v-if="organization" class="p-8">
    <NuxtLink to="/organizations" class="text-sm text-primary-600 mb-4 block">&larr; Back to all</NuxtLink>
    <h1 class="text-2xl font-bold">{{ organization.name }}</h1>

    <div class="mt-6">
      <h2 class="text-xl font-bold mb-4">Members</h2>
      <ul>
        <li v-for="member in organization.members" :key="member.userId" class="p-2 border-b flex justify-between items-center">
          <div>
            <p>{{ member.user.username }}</p>
            <p class="text-sm text-gray-500">{{ member.role }}</p>
          </div>
          <button v-if="member.role !== 'owner'" @click="removeMember(member.userId)" class="btn-danger-sm">Remove</button>
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-bold mb-4">Invite Member</h2>
      <form @submit.prevent="inviteMember" class="flex items-center gap-2">
        <input v-model="inviteEmail" type="email" placeholder="User's email" class="input flex-1" required />
        <select v-model="inviteRole" class="input">
          <option value="member">Member</option>
          <option value="owner">Owner</option>
        </select>
        <button type="submit" class="btn-primary">Invite</button>
      </form>
    </div>
  </div>

</template>