<script setup lang="ts">

import { useSchedulerStore } from '~/stores/schedulerStore';
import TriggerRow from '~/components/scheduler/TriggerRow.vue';
import AddTriggerModal from '~/components/scheduler/AddTriggerModal.vue';

const store = useSchedulerStore();
const isModalOpen = ref(false);

onMounted(() => {
  store.loadTriggers();
});

</script>

<template>

  <div class="bg-gray-900 text-white min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold mb-2">Scheduler & Triggers</h1>
          <p class="text-lg text-gray-400">Automate workflows to run in the background.</p>
        </div>
        <button @click="isModalOpen = true" class="px-5 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
          Add New Trigger
        </button>
      </header>

      <div v-if="store.isLoading">Loading triggers...</div>
      <div v-else class="space-y-4">
        <TriggerRow 
          v-for="trigger in store.triggers"
          :key="trigger.id"
          :trigger="trigger"
        />
        <div v-if="store.triggers.length === 0" class="text-center py-12 bg-gray-800 rounded-lg">
          <p class="text-gray-500">No triggers have been set up yet.</p>
        </div>
      </div>
    </div>
    <AddTriggerModal :is-open="isModalOpen" @close="isModalOpen = false" />
  </div>

</template>