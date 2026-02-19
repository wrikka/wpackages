<script setup lang="ts">

// Logic for dashboard customization will be added here
import QuickCapture from './QuickCapture.vue';
import PomodoroTimer from './PomodoroTimer.vue';
import SyncStatus from './SyncStatus.vue';
import SmartOrganizer from './SmartOrganizer.vue';

</script>

<template>

  <div class="p-4 bg-gray-900 text-white rounded-lg shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold">Dashboard</h3>
      <button class="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
        <Icon name="ph:gear" class="w-5 h-5" />
      </button>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2">
        <QuickCapture />
      </div>
      <div class="col-span-1">
        <PomodoroTimer />
      </div>
      <div class="col-span-1">
        <SyncStatus />
      </div>
      <div class="col-span-2">
        <SmartOrganizer />
      </div>
    </div>
  </div>

</template>