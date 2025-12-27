<script setup lang="ts">
interface StorageItem {
  key: string;
  value: string | null;
}

defineProps<{ 
  title: string;
  items: StorageItem[];
}>();

const emit = defineEmits(['remove-item']);

const handleRemove = (key: string) => {
  if (confirm(`Are you sure you want to delete '${key}'?`)) {
    emit('remove-item', key);
  }
};
</script>

<template>
  <div>
    <h3 class="text-2xl font-semibold mb-4">{{ title }}</h3>
    <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <table class="w-full text-left">
        <thead class="bg-gray-700">
          <tr>
            <th class="p-3 font-semibold">Key</th>
            <th class="p-3 font-semibold">Value</th>
            <th class="p-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="3" class="p-4 text-center text-gray-500">No items in storage.</td>
          </tr>
          <tr v-for="item in items" :key="item.key" class="border-t border-gray-700">
            <td class="p-3 break-all text-green-400">{{ item.key }}</td>
            <td class="p-3 break-all text-yellow-400 font-mono">{{ item.value }}</td>
            <td class="p-3 text-right">
              <button @click="handleRemove(item.key)" class="text-red-500 hover:text-red-400">
                <Icon name="i-mdi-delete-outline" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
