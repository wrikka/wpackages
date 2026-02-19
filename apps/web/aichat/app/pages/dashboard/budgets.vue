<script setup lang="ts">

const { data, pending, error } = await useFetch('/api/dashboard/budgets');

</script>

<template>

  <div>
    <h1 class="text-2xl font-bold mb-4">Budget Status</h1>
    <div v-if="error">Error loading budgets: {{ error.message }}</div>
    <div v-else-if="pending">Loading...</div>
    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2 text-left">Budget ID</th>
          <th class="border p-2 text-left">Current Cost</th>
          <th class="border p-2 text-left">Alerted</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(state, id) in data" :key="id" class="hover:bg-gray-50">
          <td class="border p-2">{{ id }}</td>
          <td class="border p-2">${{ state.currentCost.toFixed(4) }}</td>
          <td class="border p-2">{{ state.alerted ? '🔥 Yes' : 'No' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>