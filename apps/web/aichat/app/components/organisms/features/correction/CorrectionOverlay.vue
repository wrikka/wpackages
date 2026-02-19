<script setup lang="ts">

import { ref } from 'vue';
import { useCorrectionStore } from '~/stores/correctionStore';
import { useElementSelectorStore } from '~/stores/elementSelectorStore';
import { IconAlertTriangle, IconPlayerPlay, IconSend } from '@tabler/icons-vue';

const store = useCorrectionStore();
const elementSelector = useElementSelectorStore();
const correctionText = ref('');
const handleResume = () => {
  console.log('Resuming agent task...');
  store.deactivate();
};
const handleSubmitCorrection = () => {
  if (!correctionText.value) return;
  console.log('Submitting correction:', {
    newInstruction: correctionText.value,
    targetElement: elementSelector.selectedElement,
  });
  store.deactivate();
  elementSelector.deactivate();
};
// When correction mode is activated, also activate element selection mode
watch(() => store.isActive, (isActive) => {
  if (isActive) {
    elementSelector.activate();
  } else {
    elementSelector.deactivate();
  }
});

</script>

<template>

  <div v-if="store.isActive" class="fixed bottom-4 right-4 z-50 bg-yellow-500 text-black p-4 rounded-lg shadow-2xl w-full max-w-md">
    <div class="flex items-start">
      <IconAlertTriangle class="h-6 w-6 mr-3 flex-shrink-0" />
      <div>
        <h3 class="font-bold text-lg">Agent Paused</h3>
        <p class="text-sm mb-3">The agent is waiting for your input. You can correct the last action or resume.</p>
        
        <div v-if="elementSelector.selectedElement" class="bg-yellow-400 p-2 rounded-md mb-3">
          <p class="text-xs font-bold">New Target Element Selected:</p>
          <p class="text-xs truncate">Type: {{ elementSelector.selectedElement.elementType }}, Text: {{ elementSelector.selectedElement.text || 'N/A' }}</p>
        </div>
        <p v-else class="text-sm text-yellow-800 mb-3">Click on a new element on the screen to change the target.</p>

        <div class="flex items-center">
          <input 
            v-model="correctionText"
            type="text"
            placeholder="Type new instruction (e.g., 'Click here instead')"
            class="w-full bg-yellow-300 placeholder-yellow-700 text-black rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button @click="handleSubmitCorrection" class="bg-black text-white p-2 rounded-r-md hover:bg-gray-800">
            <IconSend class="h-5 w-5" />
          </button>
        </div>

      </div>
    </div>
    <div class="mt-3 flex justify-end items-center border-t border-yellow-600 pt-3">
       <button @click="handleResume" class="flex items-center font-bold text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
        <IconPlayerPlay class="h-4 w-4 mr-2" />
        Resume Agent
      </button>
    </div>
  </div>

</template>