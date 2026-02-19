<script setup lang="ts">

import { ref } from 'vue';
import { useProfileStore } from '~/stores/profileStore';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);
const store = useProfileStore();
const name = ref('');
const description = ref('');
const handleSubmit = () => {
  if (!name.value) return;
  store.createProfile({ name: name.value, description: description.value });
  name.value = '';
  description.value = '';
  emit('close');
};

</script>

<template>

  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
    <div class="w-full max-w-lg bg-gray-800 rounded-lg shadow-2xl text-white p-6">
      <h2 class="text-2xl font-bold mb-4">Create New Profile</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="profile-name" class="block mb-1 font-semibold">Profile Name</label>
          <input v-model="name" id="profile-name" type="text" placeholder="e.g., Office Assistant" class="w-full p-2 bg-gray-700 rounded-md" />
        </div>
        <div>
          <label for="profile-desc" class="block mb-1 font-semibold">Description</label>
          <textarea v-model="description" id="profile-desc" rows="3" placeholder="What is this profile for?" class="w-full p-2 bg-gray-700 rounded-md"></textarea>
        </div>
        <div class="flex justify-end space-x-4 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold">Create Profile</button>
        </div>
      </form>
    </div>
  </div>

</template>