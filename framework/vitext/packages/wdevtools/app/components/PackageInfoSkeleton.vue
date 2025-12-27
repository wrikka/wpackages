<template>
  <div class="space-y-6 animate-pulse">
    <div>
      <div class="h-6 bg-gray-700 rounded w-1/4 mb-2"></div>
      <div class="bg-gray-800 p-4 rounded space-y-3">
        <div v-for="i in 3" :key="i" class="flex justify-between items-center">
          <div class="h-4 bg-gray-700 rounded w-1/3"></div>
          <div class="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
      <div class="bg-gray-800 p-4 rounded space-y-3">
        <div v-for="i in 4" :key="i" class="flex justify-between items-center">
          <div class="h-4 bg-gray-700 rounded w-1/3"></div>
          <div class="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  </div>
</template>
