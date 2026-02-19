<script setup>

const { data: packages, pending, error, refresh } = await useFetch('/api/packages')
const newPackageName = ref('')

async function addPackage(isDev = false) {
  if (!newPackageName.value) return
  // Mock API call
  alert(`Installing ${newPackageName.value}` + (isDev ? ' as a dev dependency...' : '...'))
  // In a real app, you would POST to an API endpoint
  // For the mock, we can just optimistically update the UI
  const type = isDev ? 'devDependencies' : 'dependencies'
  packages.value[type][newPackageName.value] = 'latest'
  newPackageName.value = ''
}

async function removePackage(name, isDev) {
  alert(`Removing ${name}...`)
  // Optimistically update UI
  const type = isDev ? 'devDependencies' : 'dependencies'
  delete packages.value[type][name]
}

</script>

<template>

  <div>
    <h1 class="text-3xl font-bold mb-6">Package Manager</h1>

    <!-- Add Package -->
    <div class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 class="text-xl font-bold mb-2">Add New Package</h2>
      <div class="flex gap-2">
        <input 
          type="text" 
          v-model="newPackageName" 
          class="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., zod"
        />
        <button @click="addPackage" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add</button>
        <button @click="addPackage(true)" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Add as Dev</button>
      </div>
    </div>

    <div v-if="pending" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-center text-red-500">Failed to load packages.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Dependencies -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Dependencies</h2>
        <div v-if="Object.keys(packages.dependencies).length" class="space-y-2">
          <div v-for="(version, name) in packages.dependencies" :key="name" class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
            <span><span class="font-semibold">{{ name }}</span> <span class="text-gray-500">{{ version }}</span></span>
            <div class="flex gap-2">
              <button class="text-sm text-blue-500 hover:underline">Update</button>
              <button @click="removePackage(name, false)" class="text-sm text-red-500 hover:underline">Remove</button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500">No dependencies found.</p>
      </div>

      <!-- Dev Dependencies -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Dev Dependencies</h2>
        <div v-if="Object.keys(packages.devDependencies).length" class="space-y-2">
          <div v-for="(version, name) in packages.devDependencies" :key="name" class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
            <span><span class="font-semibold">{{ name }}</span> <span class="text-gray-500">{{ version }}</span></span>
            <div class="flex gap-2">
              <button class="text-sm text-blue-500 hover:underline">Update</button>
              <button @click="removePackage(name, true)" class="text-sm text-red-500 hover:underline">Remove</button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500">No dev dependencies found.</p>
      </div>
    </div>
  </div>

</template>