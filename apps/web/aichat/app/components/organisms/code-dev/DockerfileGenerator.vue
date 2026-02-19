<script setup lang="ts">


interface DockerfileSummary {
  type: 'dockerfile_summary';
  appType: string;
  dockerfile: string;
  notes: string[];
}
defineProps<{ summary: DockerfileSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Dockerfile</h3>
    <p class="text-sm text-gray-700"><strong>App type:</strong> {{ summary.appType }}</p>

    <div class="mt-3">
      <pre class="p-3 text-xs bg-gray-900 text-white rounded"><code>{{ summary.dockerfile }}</code></pre>
    </div>

    <div v-if="summary.notes?.length" class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Notes</h4>
      <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
        <li v-for="(n, idx) in summary.notes" :key="idx">{{ n }}</li>
      </ul>
    </div>
  </div>

</template>