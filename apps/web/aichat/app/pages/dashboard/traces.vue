<script setup lang="ts">

const { data, pending, error } = await useFetch('/api/dashboard/traces');

</script>

<template>

  <div>
    <h1 class="text-2xl font-bold mb-4">Traces</h1>
    <div v-if="error">Error loading traces: {{ error.message }}</div>
    <div v-else-if="pending">Loading...</div>
    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2 text-left">Trace ID</th>
          <th class="border p-2 text-left">Root Span</th>
          <th class="border p-2 text-left">Start Time</th>
          <th class="border p-2 text-left">Events</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trace in data" :key="trace.traceId" class="hover:bg-gray-50">
          <td class="border p-2">
            <NuxtLink :to="`/dashboard/trace/${trace.traceId}`" class="text-blue-600 hover:underline">
              {{ trace.traceId.slice(0, 8) }}...
            </NuxtLink>
          </td>
          <td class="border p-2">{{ trace.rootSpanName }}</td>
          <td class="border p-2">{{ new Date(trace.startTime).toLocaleString() }}</td>
          <td class="border p-2">{{ trace.eventCount }}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>