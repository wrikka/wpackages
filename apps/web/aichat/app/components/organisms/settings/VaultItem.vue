<script setup lang="ts">

import { ref } from 'vue';
import { useVaultStore } from '~/stores/vaultStore';
import type { VaultItem } from '~/shared/types/vault';

const props = defineProps<{ item: VaultItem }>();
const store = useVaultStore();
const isRevealed = ref(false);
const handleDelete = () => {
  if (confirm(`Are you sure you want to delete '${props.item.name}'?`)) {
    store.deleteItem(props.item.id);
  }
};

</script>

<template>

  <div class="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
    <div>
      <p class="font-bold text-lg">{{ item.name }}</p>
      <p class="text-sm text-gray-400">Type: {{ item.type }}</p>
      <div class="mt-2 font-mono text-sm">
        <span v-if="isRevealed" class="text-green-400">{{ item.value }}</span>
        <span v-else>••••••••••••••••</span>
      </div>
    </div>
    <div class="flex space-x-2">
      <button @click="isRevealed = !isRevealed" class="p-2 hover:bg-gray-700 rounded-md">
        {{ isRevealed ? 'Hide' : 'Reveal' }}
      </button>
      <button class="p-2 hover:bg-gray-700 rounded-md">Edit</button>
      <button @click="handleDelete" class="p-2 text-red-500 hover:bg-red-900 rounded-md">Delete</button>
    </div>
  </div>

</template>