<script setup lang="ts">

import { useProfileStore } from '~/stores/profileStore';
import type { AgentProfile } from '~/shared/types/profiles';

const props = defineProps<{ profile: AgentProfile }>();
const store = useProfileStore();
const isActive = computed(() => store.activeProfileId === props.profile.id);

</script>

<template>

  <div class="bg-gray-800 p-6 rounded-lg border-2" :class="isActive ? 'border-blue-500' : 'border-transparent'">
    <h3 class="text-xl font-bold mb-2">{{ profile.name }}</h3>
    <p class="text-sm text-gray-400 mb-4 h-10 overflow-hidden">{{ profile.description }}</p>
    <div class="flex justify-between items-center">
      <button class="text-sm text-gray-400 hover:text-white">Edit</button>
      <button 
        @click="store.setActiveProfile(profile.id)"
        :disabled="isActive"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {{ isActive ? 'Active' : 'Activate' }}
      </button>
    </div>
  </div>

</template>