<script setup lang="ts">

const { data, pending, error } = await useFetch('/api/workflows');

function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

</script>

<template>

  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Workflow Runs</h1>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else-if="error">
      Error loading workflow runs: {{ error.message }}
    </div>
    <div v-else-if="data && data.runs">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="run in data.runs" :key="run.runId">
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/workflows/${run.runId}`" class="text-blue-600 hover:underline">
                {{ run.runId }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatTimestamp(run.updatedAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      No workflow runs found.
    </div>
  </div>

</template>