<script setup lang="ts">
import { computed } from 'vue';
import SpanBar from './SpanBar.vue';

const props = defineProps<{ trace: any[] }>();

const sortedSpans = computed(() => {
  return [...props.trace].sort((a, b) => a.startTime - b.startTime);
});

const traceStartTime = computed(() => sortedSpans.value[0]?.startTime ?? 0);
const traceEndTime = computed(() => {
  return Math.max(...sortedSpans.value.map(s => s.endTime ?? s.startTime));
});

const traceDuration = computed(() => traceEndTime.value - traceStartTime.value);

const getSpanOffset = (span: any) => {
  if (traceDuration.value === 0) return 0;
  return ((span.startTime - traceStartTime.value) / traceDuration.value) * 100;
};

const getSpanWidth = (span: any) => {
  if (traceDuration.value === 0) return 100;
  const duration = (span.endTime ?? traceEndTime.value) - span.startTime;
  return (duration / traceDuration.value) * 100;
};
</script>

<template>
  <div class="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="font-mono text-sm text-green-400">Trace ID: {{ trace[0]?.traceId }}</h3>
        <p class="text-xs text-gray-400">Duration: {{ traceDuration.toFixed(2) }} ms</p>
      </div>
      <div class="text-xs text-gray-500">{{ trace.length }} spans</div>
    </div>
    <div class="relative bg-gray-900/50 p-2 rounded-md space-y-1">
      <SpanBar
        v-for="span in sortedSpans"
        :key="span.spanId"
        :span="span"
        :style="{ 
          'margin-left': `${getSpanOffset(span)}%`, 
          'width': `${getSpanWidth(span)}%` 
        }"
      />
    </div>
  </div>
</template>
