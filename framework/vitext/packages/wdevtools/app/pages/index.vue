<script setup lang="ts">
const { packageInfo, isConnected } = useViteServer();
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Package Info</h2>
    <div v-if="!isConnected || !packageInfo">
      <PackageInfoSkeleton />
    </div>
    <div v-else-if="packageInfo && packageInfo.error">
      <p class="text-red-400">Error loading package info: {{ packageInfo.error }}</p>
    </div>
    <div v-else-if="packageInfo" class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold mb-2">Dependencies</h3>
        <div class="bg-gray-800 p-4 rounded space-y-2">
          <div v-for="(version, name) in packageInfo.dependencies" :key="name" class="flex justify-between">
            <span>{{ name }}</span>
            <span class="text-gray-400">{{ version }}</span>
          </div>
          <div v-if="!packageInfo.dependencies || Object.keys(packageInfo.dependencies).length === 0" class="text-gray-500">No dependencies.</div>
        </div>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-2">Dev Dependencies</h3>
        <div class="bg-gray-800 p-4 rounded space-y-2">
          <div v-for="(version, name) in packageInfo.devDependencies" :key="name" class="flex justify-between">
            <span>{{ name }}</span>
            <span class="text-gray-400">{{ version }}</span>
          </div>
           <div v-if="!packageInfo.devDependencies || Object.keys(packageInfo.devDependencies).length === 0" class="text-gray-500">No dev dependencies.</div>
        </div>
      </div>
    </div>
  </div>
</template>
