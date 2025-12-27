<script setup lang="ts">
const { localStorageItems, sessionStorageItems, refresh, setItem, removeItem } = useBrowserStorage();

const newItemKey = ref('');
const newItemValue = ref('');
const selectedStorage = ref<'local' | 'session'>('local');

const handleAddItem = () => {
  if (newItemKey.value && newItemValue.value) {
    setItem(selectedStorage.value, newItemKey.value, newItemValue.value);
    newItemKey.value = '';
    newItemValue.value = '';
  }
};
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold">Browser Storage</h1>

    <!-- Add new item form -->
    <div class="bg-gray-800 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-3">Add New Item</h2>
      <div class="flex gap-4 items-end">
        <div class="flex-grow">
          <label for="storage-type" class="block text-sm font-medium mb-1">Storage</label>
          <select v-model="selectedStorage" id="storage-type" class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
            <option value="local">Local Storage</option>
            <option value="session">Session Storage</option>
          </select>
        </div>
        <div class="flex-grow">
          <label for="item-key" class="block text-sm font-medium mb-1">Key</label>
          <input v-model="newItemKey" type="text" id="item-key" placeholder="Enter key" class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div class="flex-grow">
          <label for="item-value" class="block text-sm font-medium mb-1">Value</label>
          <input v-model="newItemValue" type="text" id="item-value" placeholder="Enter value" class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button @click="handleAddItem" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">Add</button>
      </div>
    </div>

    <!-- Storage Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <StorageTable title="Local Storage" :items="localStorageItems" @remove-item="(key: string) => removeItem('local', key)" />
      <StorageTable title="Session Storage" :items="sessionStorageItems" @remove-item="(key: string) => removeItem('session', key)" />
    </div>

     <button @click="refresh" class="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center gap-2">
      <Icon name="i-mdi-refresh" />
      Refresh All
    </button>
  </div>
</template>
