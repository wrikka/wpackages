<script setup lang="ts">

import { useHistoryStore } from '~/stores/historyStore';

const store = useHistoryStore();
const handleUndo = (actionId: string) => {
  store.undoAction(actionId);
};

</script>

<template>

  <div class="bg-gray-800 rounded-lg p-6">
    <ul v-if="store.history.length > 0" class="space-y-4">
      <li 
        v-for="item in store.history"
        :key="item.id"
        class="flex justify-between items-center p-4 bg-gray-700 rounded-md"
        :class="{ 'opacity-50': item.status === 'undone' }"
      >
        <div>
          <p class="font-bold">{{ item.action.type }}</p>
          <p class="text-sm text-gray-400">{{ item.action.details }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ new Date(item.timestamp).toLocaleTimeString() }}</p>
        </div>
        <button 
          @click="handleUndo(item.id)"
          :disabled="item.status === 'undone'"
          class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {{ item.status === 'undone' ? 'Undone' : 'Undo' }}
        </button>
      </li>
    </ul>
    <div v-else class="text-center text-gray-500 py-8">
      <p>No actions have been recorded yet.</p>
    </div>
  </div>

</template>