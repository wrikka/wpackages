<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import TraceWaterfall from './components/TraceWaterfall.vue';

const traces = ref<any[]>([]);
const lastUpdatedAt = ref<Date | null>(null);

const { data, error, refresh } = await useFetch('/api/v1/traces');

onMounted(() => {
  traces.value = data.value as any[] || [];
  lastUpdatedAt.value = new Date();

  setInterval(async () => {
    await refresh();
    traces.value = data.value as any[] || [];
    lastUpdatedAt.value = new Date();
  }, 2000);
});

const groupedTraces = computed(() => {
  const groups = new Map<string, any[]>();
  for (const span of traces.value) {
    if (!groups.has(span.traceId)) {
      groups.set(span.traceId, []);
    }
    groups.get(span.traceId)?.push(span);
  }
  return Array.from(groups.values());
});
</script>

<template>
  <div class="bg-gray-900 text-gray-100 min-h-screen font-sans">
    <header class="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3">
        <h1 class="text-xl font-bold text-green-400">@wpackages/tracing UI</h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div class="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700 flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold">Live Traces</h2>
          <p class="text-gray-400 text-sm">Actively polling for new traces...</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-mono">{{ traces.length }}</p>
          <p class="text-xs text-gray-500" v-if="lastUpdatedAt">
            Updated: {{ lastUpdatedAt.toLocaleTimeString() }}
          </p>
        </div>
      </div>

      <div v-if="error" class="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
        <p><strong>Error fetching traces:</strong> {{ error.message }}</p>
      </div>

      <div v-else-if="traces.length === 0" class="text-center py-16">
        <p class="text-gray-500">Waiting for traces...</p>
        <p class="text-sm text-gray-600 mt-2">Ensure your application is running and configured with the WebUiExporter.</p>
      </div>

      <div v-else class="space-y-4">
        <TraceWaterfall v-for="(trace, index) in groupedTraces" :key="index" :trace="trace" />
      </div>

    </main>
  </div>
</template>
