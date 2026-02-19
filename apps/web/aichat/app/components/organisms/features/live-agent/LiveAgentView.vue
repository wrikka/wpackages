<script setup lang="ts">

import { useLiveAgentStore } from '~/stores/liveAgentStore';
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop, IconEye } from '@tabler/icons-vue';

const store = useLiveAgentStore();
// This would ideally use a draggable library like VueUse's useDraggable
const handleDrag = (event: MouseEvent) => {
  // Placeholder for drag logic
};
const highlightStyle = computed(() => {
  if (!store.currentState?.targetElementBounds) return {};
  const bounds = store.currentState.targetElementBounds;
  // This assumes the screenshot is displayed at its native resolution inside the view
  // Scaling would require more complex calculations.
  return {
    position: 'absolute',
    left: `${bounds.x}px`,
    top: `${bounds.y}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    border: '3px solid #f59e0b',
    boxShadow: '0 0 15px #f59e0b',
    borderRadius: '4px',
  };
});

</script>

<template>

  <div 
    v-if="store.isVisible"
    class="fixed bottom-5 right-5 z-50 w-96 bg-gray-900 border-2 border-blue-500 rounded-lg shadow-2xl flex flex-col text-white"
    @mousedown="handleDrag"
  >
    <header class="bg-gray-800 p-2 rounded-t-lg cursor-move flex items-center justify-between">
      <div class="flex items-center">
        <Icon name="lucide:eye" class="h-5 w-5 mr-2 text-blue-400" />
        <span class="font-bold">Agent Live View</span>
      </div>
      <button @click="store.hide()" class="text-gray-400 hover:text-white">X</button>
    </header>

    <div class="relative bg-black aspect-video">
      <img 
        v-if="store.currentState?.screenshotUrl"
        :src="store.currentState.screenshotUrl"
        alt="Agent's view of the screen"
        class="w-full h-full object-contain"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-500">No screen view available</div>
      <!-- Element Highlighter -->
      <div v-if="store.currentState?.targetElementBounds" :style="highlightStyle"></div>
    </div>

    <div class="p-3 bg-gray-800">
      <p class="text-sm truncate"><span class="font-bold">Status:</span> {{ store.currentState?.status || 'Idle' }}</p>
      <p class="text-sm truncate"><span class="font-bold">Action:</span> {{ store.currentState?.currentAction || 'None' }}</p>
    </div>

    <footer class="flex justify-around p-2 bg-gray-900 rounded-b-lg border-t border-gray-700">
      <button @click="store.pauseAgent" class="p-2 hover:bg-gray-700 rounded-full">
        <Icon name="lucide:player-pause" class="h-6 w-6" />
      </button>
      <button @click="store.resumeAgent" class="p-2 hover:bg-gray-700 rounded-full">
        <Icon name="lucide:play" class="h-6 w-6" />
      </button>
      <button @click="store.stopAgent" class="p-2 text-red-500 hover:bg-red-900 rounded-full">
        <Icon name="lucide:player-stop" class="h-6 w-6" />
      </button>
    </footer>
  </div>

</template>