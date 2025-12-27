<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 animate-pulse">
    <div class="bg-gray-700 p-3 flex justify-between">
      <div class="h-6 bg-gray-600 rounded w-32"></div>
      <div class="h-6 bg-gray-600 rounded w-48"></div>
    </div>
    <div class="p-3 space-y-3">
      <div v-for="i in 5" :key="i" class="flex space-x-4 items-center border-t border-gray-700 pt-3 first:border-t-0">
        <div class="h-4 bg-gray-600 rounded w-32"></div>
        <div class="h-4 bg-gray-600 rounded flex-1"></div>
      </div>
    </div>
  </div>
</template>
