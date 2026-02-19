<script setup lang="ts">

import { useSettingsStore } from '~/stores/settingsStore';

const store = useSettingsStore();
const cpuLimit = computed({
  get: () => store.settings.performance.cpuLimitPercent,
  set: (value) => store.updateSetting('performance', { ...store.settings.performance, cpuLimitPercent: Number(value) }),
});
const memoryLimit = computed({
  get: () => store.settings.performance.memoryLimitMB,
  set: (value) => store.updateSetting('performance', { ...store.settings.performance, memoryLimitMB: Number(value) }),
});

</script>

<template>

  <section class="bg-gray-800 p-6 rounded-lg">
    <h2 class="text-xl font-semibold">Performance Limits</h2>
    <p class="text-sm text-gray-400 mt-1 mb-6">Prevent the agent from slowing down your computer by setting resource limits.</p>
    
    <div class="space-y-6">
      <div>
        <label for="cpu-limit" class="flex justify-between items-center mb-1">
          <span class="font-semibold">Max CPU Usage</span>
          <span class="text-blue-400 font-mono">{{ cpuLimit }}%</span>
        </label>
        <input 
          id="cpu-limit"
          type="range"
          min="10"
          max="100"
          step="5"
          v-model="cpuLimit"
          class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label for="memory-limit" class="flex justify-between items-center mb-1">
          <span class="font-semibold">Max Memory Usage</span>
          <span class="text-blue-400 font-mono">{{ memoryLimit }} MB</span>
        </label>
        <input 
          id="memory-limit"
          type="range"
          min="512"
          max="8192"
          step="256"
          v-model="memoryLimit"
          class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  </section>

</template>