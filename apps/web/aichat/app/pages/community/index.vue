<script setup lang="ts">

import { useCommunityStore } from '~/stores/communityStore';
import CommunityWorkflowCard from '~/components/community/CommunityWorkflowCard.vue';
import SearchBar from '~/components/community/SearchBar.vue';

const store = useCommunityStore();

onMounted(() => {
  store.fetchWorkflows();
});

const filteredWorkflows = computed(() => store.workflows);

</script>

<template>

  <div class="bg-gray-900 text-white min-h-screen p-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Community Workflows</h1>
      <p class="text-lg text-gray-400">Discover and share automations with the community.</p>
    </header>
    
    <SearchBar class="mb-8" />

    <div v-if="store.isLoading" class="text-center">
      <p>Loading workflows...</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CommunityWorkflowCard 
        v-for="workflow in filteredWorkflows"
        :key="workflow.id"
        :workflow="workflow"
      />
    </div>
  </div>

</template>