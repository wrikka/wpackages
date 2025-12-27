<script setup lang="ts">
interface GitFile {
  status: string;
  path: string;
}

defineProps<{ 
  files: GitFile[];
}>();

const statusMap: Record<string, { color: string; text: string }> = {
  'M': { color: 'text-yellow-400', text: 'Modified' },
  'A': { color: 'text-green-400', text: 'Added' },
  'D': { color: 'text-red-400', text: 'Deleted' },
  '??': { color: 'text-blue-400', text: 'Untracked' },
};

const getStatusInfo = (status: string) => {
  return statusMap[status] || { color: 'text-gray-400', text: 'Unknown' };
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
    <table class="w-full text-left">
      <thead class="bg-gray-700">
        <tr>
          <th class="p-3 font-semibold w-32">Status</th>
          <th class="p-3 font-semibold">File Path</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="files.length === 0">
          <td colspan="2" class="p-4 text-center text-gray-500">No changes detected.</td>
        </tr>
        <tr v-for="file in files" :key="file.path" class="border-t border-gray-700">
          <td class="p-3">
            <span :class="getStatusInfo(file.status).color" class="font-semibold">{{ getStatusInfo(file.status).text }}</span>
          </td>
          <td class="p-3 font-mono">{{ file.path }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
