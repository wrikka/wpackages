<script setup lang="ts">

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { buildTraceTree } from '~/utils/trace-renderer';
import type { SpanInfo } from '~/utils/trace-renderer';

const route = useRoute();
const { data, pending, error } = await useFetch(`/api/dashboard/traces/${route.params.id}`);

const traceTree = computed<SpanInfo[]>(() => {
  if (!data.value) return [];
  return buildTraceTree(data.value);
});

</script>

<template>

  <div>
    <NuxtLink to="/dashboard/traces" class="text-blue-600 hover:underline">&larr; Back to all traces</NuxtLink>
    <h1 class="text-2xl font-bold mt-4 mb-4">Trace Details: {{ route.params.id }}</h1>
    <div v-if="error">Error loading trace: {{ error.message }}</div>
    <div v-else-if="pending">Loading...</div>
    <ul v-else-if="traceTree.length > 0" class="trace-tree pl-0">
      <DashboardSpanNode v-for="span in traceTree" :key="span.spanId" :span="span" />
    </ul>
    <div v-else>No spans found for this trace.</div>
  </div>

</template>

<style scoped>

.trace-tree {
  padding-left: 0;
}

</style>