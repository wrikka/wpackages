<script setup lang="ts">

import { ref } from 'vue';
import { useSchedulerStore } from '~/stores/schedulerStore';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);
const store = useSchedulerStore();
const name = ref('');
const triggerType = ref('schedule');
const handleSubmit = () => {
  // Form validation would go here
  console.log('Adding new trigger...');
  // This is a placeholder, a real form would be more complex
  store.addTrigger({
    name: name.value || 'New Trigger',
    type: triggerType.value as any,
    workflowId: 'wf-1',
    workflowName: 'Daily Report',
    description: 'Every day at 9:00 AM',
    enabled: true,
  });
  emit('close');
};

</script>

<template>

  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
    <div class="w-full max-w-lg bg-gray-800 rounded-lg shadow-2xl text-white p-6">
      <h2 class="text-2xl font-bold mb-4">Add New Trigger</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold">Trigger Name</label>
          <input v-model="name" type="text" placeholder="e.g., Morning Report" class="w-full p-2 bg-gray-700 rounded-md" />
        </div>
        <div>
          <label class="block mb-1 font-semibold">Trigger Type</label>
          <select v-model="triggerType" class="w-full p-2 bg-gray-700 rounded-md">
            <option value="schedule">On a schedule (e.g., time-based)</option>
            <option value="event">On an event (e.g., file added)</option>
          </select>
        </div>
        <!-- More complex form fields for schedule/event config would go here -->
        <div class="flex justify-end space-x-4 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-600 rounded-md">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 rounded-md font-bold">Save Trigger</button>
        </div>
      </form>
    </div>
  </div>

</template>