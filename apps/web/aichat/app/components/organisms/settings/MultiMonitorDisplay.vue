<script setup lang="ts">

import { useDisplayStore } from '~/stores/displayStore';

const store = useDisplayStore();
onMounted(() => {
  store.detectDisplays();
});
// This is a simplified visualization. A real implementation would need
// to handle scaling and positioning more robustly.
const containerStyle = computed(() => {
  const allBounds = store.displays.map(d => d.bounds);
  if (allBounds.length === 0) return {};
  const minX = Math.min(...allBounds.map(b => b.x));
  const minY = Math.min(...allBounds.map(b => b.y));
  const maxX = Math.max(...allBounds.map(b => b.x + b.width));
  const maxY = Math.max(...allBounds.map(b => b.y + b.height));
  const totalWidth = maxX - minX;
  const totalHeight = maxY - minY;
  return {
    width: `${totalWidth / 10}px`, // Scale down for display
    height: `${totalHeight / 10}px`,
  };
});
const monitorStyle = (display: any) => {
  const bounds = display.bounds;
  const minX = Math.min(...store.displays.map(d => d.bounds.x));
  const minY = Math.min(...store.displays.map(d => d.bounds.y));
  return {
    position: 'absolute',
    left: `${(bounds.x - minX) / 10}px`,
    top: `${(bounds.y - minY) / 10}px`,
    width: `${bounds.width / 10}px`,
    height: `${bounds.height / 10}px`,
  };
};

</script>

<template>

  <section class="bg-gray-800 p-6 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Detected Displays</h2>
    <div v-if="store.isLoading">Detecting displays...</div>
    <div v-else class="relative bg-gray-900 rounded-md p-4 h-64 flex items-center justify-center">
      <div class="relative" :style="containerStyle">
        <div 
          v-for="display in store.displays"
          :key="display.id"
          class="bg-blue-900 border-2 border-blue-500 rounded flex flex-col items-center justify-center text-xs"
          :style="monitorStyle(display)"
        >
          <p class="font-bold">{{ display.name }}</p>
          <p>{{ display.bounds.width }}x{{ display.bounds.height }}</p>
          <p v-if="display.isPrimary" class="text-yellow-400">(Primary)</p>
        </div>
      </div>
    </div>
  </section>

</template>