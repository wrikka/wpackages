<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

const consoleLogs = ref<string[]>([]);
const logContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  const originalLog = console.log;
  console.log = (...args) => {
    consoleLogs.value.push(args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
      } catch (e) {
        return 'Unserializable object';
      }
    }).join(' '));
    originalLog.apply(console, args);
  };
});

watch(consoleLogs, async () => {
  await nextTick();
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
}, { deep: true });

const clearLogs = () => {
  consoleLogs.value = [];
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Console Logs</h2>
      <button @click="clearLogs" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center gap-2">
        <Icon name="i-mdi-delete-sweep-outline" />
        Clear Logs
      </button>
    </div>
    <div ref="logContainer" class="bg-gray-800 rounded p-4 font-mono text-sm space-y-2 overflow-y-auto h-96">
      <pre v-for="(log, index) in consoleLogs" :key="index" class="border-b border-gray-700 pb-1 whitespace-pre-wrap">{{ log }}</pre>
      <div v-if="consoleLogs.length === 0" class="text-gray-500">No console logs captured yet.</div>
    </div>
  </div>
</template>
