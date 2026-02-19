<script setup lang="ts">

import type { MobileNotification } from '~/shared/types/mobile';

const notifications: MobileNotification[] = [
  { id: 'notif-1', title: 'Workflow Completed', message: '\'Daily Report\' ran successfully.', timestamp: '2m ago', type: 'success' },
  { id: 'notif-2', title: 'Agent Needs Help', message: 'Could not find file \'sales_data.xlsx\'.', timestamp: '15m ago', type: 'warning' },
  { id: 'notif-3', title: 'New Suggestion', message: 'Automate your weekly expense report?', timestamp: '1h ago', type: 'info' },
];

</script>

<template>

  <section>
    <h2 class="text-lg font-semibold text-gray-400 mb-3">Notifications</h2>
    <div class="space-y-3">
      <div 
        v-for="notif in notifications"
        :key="notif.id"
        class="bg-gray-800 p-3 rounded-lg flex items-start"
      >
        <!-- Icon placeholder -->
        <div class="w-8 h-8 bg-gray-700 rounded-full mr-3 mt-1 flex-shrink-0"></div>
        <div>
          <p class="font-bold">{{ notif.title }}</p>
          <p class="text-sm text-gray-300">{{ notif.message }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ notif.timestamp }}</p>
        </div>
      </div>
    </div>
  </section>

</template>