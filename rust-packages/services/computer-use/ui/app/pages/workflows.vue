<script setup>

// Logic for the workflow builder will go here

</script>

<template>

  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Workflow Builder</h1>
      <UButton>Save Workflow</UButton>
    </div>
    <div class="flex-1 flex gap-4 overflow-hidden">
      <WorkflowCanvas />
      <WorkflowSidebar />
    </div>
  </div>

</template>