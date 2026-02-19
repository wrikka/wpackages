<script setup lang="ts">

import { useTaskRecorderStore } from '~/stores/recorderStore';
import { IconPlayerRecord, IconPlayerPause, IconPlayerStop, IconCircleDotted } from '@tabler/icons-vue';

const store = useTaskRecorderStore();
const handleToggleRecord = () => {
  if (store.status === 'recording') {
    store.pauseRecording();
  } else {
    store.startRecording();
  }
};
const handleStop = () => {
  store.stopRecording();
  // TODO: Prompt user to save the new workflow
  console.log('Workflow saved:', store.recordedActions);
};

</script>

<template>

  <div v-if="store.status !== 'idle'" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white p-3 rounded-full shadow-2xl flex items-center space-x-4">
    <div class="flex items-center">
      <Icon name="lucide:loader-2" class="h-6 w-6 text-red-500 animate-ping absolute" />
      <Icon name="lucide:circle-dot" class="h-6 w-6 text-red-500" />
      <span class="ml-2 font-mono text-lg">{{ store.status === 'recording' ? 'REC' : 'PAUSED' }}</span>
    </div>
    
    <div class="h-6 w-px bg-gray-700"></div>

    <span class="text-sm text-gray-400">{{ store.recordedActions.length }} actions recorded</span>

    <div class="h-6 w-px bg-gray-700"></div>

    <button @click="handleToggleRecord" class="p-2 hover:bg-gray-700 rounded-full">
      <Icon name="lucide:player-pause" class="h-6 w-6" />
      <Icon name="lucide:circle" class="h-6 w-6" />
    </button>
    <button @click="handleStop" class="p-2 bg-red-600 hover:bg-red-700 rounded-full">
      <Icon name="lucide:player-stop" class="h-6 w-6" />
    </button>
  </div>

</template>