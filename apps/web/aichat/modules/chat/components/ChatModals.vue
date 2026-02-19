<script setup lang="ts">


const isSystemPromptModalOpen = ref(false)
defineExpose({
  isSystemPromptModalOpen,
})

</script>

<template>

  <!-- System Prompt Modal -->
  <UModal v-model="isSystemPromptModalOpen">
    <UCard>
      <template #header>
        <h3>System Prompt</h3>
      </template>
      
      <div class="py-4">
        <p>System prompt functionality coming soon...</p>
      </div>
      
      <div class="flex justify-end gap-2">
        <UButton color="gray" variant="soft" @click="isSystemPromptModalOpen = false">
          Close
        </UButton>
      </div>
    </UCard>
  </UModal>

</template>