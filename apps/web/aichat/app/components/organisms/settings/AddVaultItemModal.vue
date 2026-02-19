<script setup lang="ts">

import { ref } from 'vue';
import { useVaultStore } from '~/stores/vaultStore';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);
const store = useVaultStore();
const name = ref('');
const type = ref('api_key');
const value = ref('');
const handleSubmit = () => {
  if (!name.value || !value.value) {
    alert('Please fill in all fields.');
    return;
  }
  store.addItem({
    name: name.value,
    type: type.value as any,
    value: value.value,
  });
  name.value = '';
  type.value = 'api_key';
  value.value = '';
  emit('close');
};

</script>

<template>

  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
    <div class="w-full max-w-lg bg-gray-800 rounded-lg shadow-2xl text-white p-6">
      <h2 class="text-2xl font-bold mb-4">Add New Credential</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block mb-1 font-semibold">Name</label>
          <input v-model="name" id="name" type="text" placeholder="e.g., GitHub API Key" class="w-full p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label for="type" class="block mb-1 font-semibold">Type</label>
          <select v-model="type" id="type" class="w-full p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="api_key">API Key</option>
            <option value="password">Password</option>
            <option value="token">Bearer Token</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label for="value" class="block mb-1 font-semibold">Value / Secret</label>
          <input v-model="value" id="value" type="password" class="w-full p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex justify-end space-x-4 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold">Save Credential</button>
        </div>
      </form>
    </div>
  </div>

</template>