<script setup>

import { ref } from 'vue'

const isPlanModalOpen = ref(false)
const isNewTaskModalOpen = ref(false)
const isAssistanceModalOpen = ref(false)

</script>

<template>

  <div class="p-4 h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <Header @request-help="isAssistanceModalOpen = true" />

    <!-- Main Content -->
    <div class="flex-1 flex gap-4 overflow-hidden pt-4">
      <!-- Main Panel -->
      <div class="flex-1 flex flex-col gap-4">
        <SnapshotInspector />
      </div>

      <!-- Sidebar -->
      <aside class="w-96 flex flex-col gap-4">
        <ActionLog />
        <SessionManager @new-task="isNewTaskModalOpen = true" />
        <MemoryInspector />
      </aside>
    </div>

    <CommandBar @show-plan="isPlanModalOpen = true" />

    <ActionPlanModal v-model="isPlanModalOpen" />
    <NewTaskModal v-model="isNewTaskModalOpen" />
    <AssistanceRequestModal v-model="isAssistanceModalOpen" />
  </div>

</template>