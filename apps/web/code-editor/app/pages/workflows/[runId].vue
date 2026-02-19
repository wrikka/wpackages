<script setup lang="ts">

const route = useRoute();
const runId = route.params.runId as string;

const { data, pending, error } = await useFetch(`/api/workflows/${runId}`);

</script>

<template>

  <div class="p-4">
    <NuxtLink to="/workflows" class="text-blue-600 hover:underline mb-4 block">&larr; Back to all runs</NuxtLink>
    <h1 class="text-2xl font-bold mb-4">Workflow Run Details</h1>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else-if="error">
      Error loading workflow run: {{ error.message }}
    </div>
    <div v-else-if="data && data.run">
      <h2 class="text-xl font-semibold">Run ID: {{ data.run.runId }}</h2>
      <p class="text-sm text-gray-500">Last Updated: {{ new Date(data.run.updatedAt * 1000).toLocaleString() }}</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Workflow State</h3>
      <pre class="bg-gray-100 p-4 rounded-md overflow-x-auto"><code>{{ JSON.stringify(data.run.state, null, 2) }}</code></pre>
    </div>
    <div v-else>
      Workflow run not found.
    </div>
  </div>

</template>