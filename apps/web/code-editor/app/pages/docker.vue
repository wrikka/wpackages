<script setup>

const { data: containers, pending, error } = await useFetch('/api/docker')

</script>

<template>

  <div>
    <h1 class="text-3xl font-bold mb-6">Docker Containers</h1>

    <div v-if="pending" class="text-center">Loading containers...</div>
    <div v-else-if="error" class="text-center text-red-500">Failed to load containers.</div>
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ports</th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="container in containers" :key="container.id">
            <td class="px-6 py-4 whitespace-nowrap font-medium">{{ container.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ container.image }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="container.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ container.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{{ container.ports }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button v-if="container.status !== 'running'" class="text-green-600 hover:text-green-900">Start</button>
              <button v-if="container.status === 'running'" class="text-red-600 hover:text-red-900">Stop</button>
              <button class="text-indigo-600 hover:text-indigo-900">Restart</button>
              <button class="text-gray-600 hover:text-gray-900">Logs</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>