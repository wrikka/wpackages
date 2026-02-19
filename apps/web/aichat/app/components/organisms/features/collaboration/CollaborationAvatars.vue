<script setup lang="ts">

import type { Collaborator, AwarenessState } from '~/shared/types/collaboration'

const props = defineProps<{
  collaborators: Collaborator[]
  currentUser: Collaborator | null
}>()
const emit = defineEmits<{
  invite: []
  followUser: [userId: string]
  toggleFollow: []
}>()
const isExpanded = ref(false)
const followingUserId = ref<string | null>(null)
const activeCollaborators = computed(() => {
  return props.collaborators.filter(c => c.isActive)
})
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

</script>

<template>

  <div class="collaboration-panel">
    <div class="flex items-center gap-2">
      <div class="flex -space-x-2">
        <div
          v-for="user in activeCollaborators.slice(0, 3)"
          :key="user.id"
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-900"
          :style="{ backgroundColor: user.color }"
          :title="user.name"
        >
          {{ getInitials(user.name) }}
        </div>
        <button
          v-if="activeCollaborators.length > 3"
          class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs border-2 border-white dark:border-gray-900"
          @click="isExpanded = !isExpanded"
        >
          +{{ activeCollaborators.length - 3 }}
        </button>
      </div>
      
      <button class="btn-icon text-sm" title="Invite collaborators" @click="emit('invite')">
        <span class="i-carbon-user-follow"></span>
      </button>
    </div>
    
    <div
      v-if="isExpanded"
      class="collaborator-list absolute right-0 top-full mt-2 w-56 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div
        v-for="user in collaborators"
        :key="user.id"
        class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        :class="{ 'bg-primary-50 dark:bg-primary-900/20': followingUserId === user.id }"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
          :style="{ backgroundColor: user.color }"
        >
          {{ getInitials(user.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate">{{ user.name }}</p>
          <p class="text-xs text-gray-400">{{ user.isActive ? 'Active' : `Last seen ${new Date(user.lastSeen).toLocaleTimeString()}` }}</p>
        </div>
        <button
          v-if="user.id !== currentUser?.id"
          class="btn-icon text-xs"
          :class="followingUserId === user.id ? 'text-primary-500' : ''"
          @click="followingUserId = followingUserId === user.id ? null : user.id; emit('followUser', user.id)"
        >
          <span :class="followingUserId === user.id ? 'i-carbon-view-filled' : 'i-carbon-view'"></span>
        </button>
      </div>
    </div>
  </div>

</template>