<script setup>

import { ref } from 'vue'

const isPlanModalOpen = ref(false)
const isNewTaskModalOpen = ref(false)
const isAssistanceModalOpen = ref(false)

// This logic will be moved to a global state management solution later
// For now, it lives in the layout to control the modals globally.

</script>

<template>

  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <Header @request-help="isAssistanceModalOpen = true" />
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-56 p-4 border-r dark:border-gray-700">
        <Navigation />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 overflow-y-auto">
        <slot />
      </main>
    </div>

    <ActionPlanModal v-model="isPlanModalOpen" />
    <NewTaskModal v-model="isNewTaskModalOpen" />
    <AssistanceRequestModal v-model="isAssistanceModalOpen" />
  </div>

</template>