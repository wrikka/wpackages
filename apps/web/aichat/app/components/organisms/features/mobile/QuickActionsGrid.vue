<script setup lang="ts">

import type { QuickAction } from '~/shared/types/mobile';

const quickActions: QuickAction[] = [
  { id: 'qa-1', name: 'Daily Report', icon: 'IconReport' },
  { id: 'qa-2', name: 'Post to Socials', icon: 'IconShare' },
  { id: 'qa-3', name: 'Clean Desktop', icon: 'IconBrush' },
  { id: 'qa-4', name: 'Start Focus Mode', icon: 'IconClock' },
];
const runAction = (name: string) => {
  alert(`Running '${name}'...`);
};

</script>

<template>

  <section class="mb-8">
    <h2 class="text-lg font-semibold text-gray-400 mb-3">Quick Actions</h2>
    <div class="grid grid-cols-2 gap-4">
      <div 
        v-for="action in quickActions"
        :key="action.id"
        @click="runAction(action.name)"
        class="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-700"
      >
        <!-- Icon placeholder -->
        <div class="w-10 h-10 bg-blue-600 rounded-lg mb-2"></div>
        <p class="text-sm text-center">{{ action.name }}</p>
      </div>
    </div>
  </section>

</template>