<script setup lang="ts">


const chatUIStore = useChatUIStore()
const sessionsStore = useSessionsStore()
const { copy } = useClipboard()
const toast = useToast()
const isShareModalOpen = ref(false)
const shareLink = ref('')
const copyShareLink = () => {
  copy(shareLink.value)
  toast.add({ title: 'Link copied!' })
  isShareModalOpen.value = false
}
const handleExport = () => {
  const sessionId = sessionsStore.currentSession?.id;
  if (!sessionId) {
    toast.add({ title: 'No active session', description: 'Please select a chat session to export.', color: 'yellow' });
    return;
  }
  window.open(`/api/sessions/${sessionId}/export`, '_blank');
};
const toggleRightPanel = () => {
  chatUIStore.toggleRightPanel()
}
defineExpose({
  copyShareLink,
  isShareModalOpen,
  shareLink,
  toggleRightPanel,
})

</script>

<template>

  <div class="flex items-center gap-2">
    <!-- Action buttons -->
    <div class="flex items-center gap-2">
      <UButton
        icon="i-heroicons-share"
        size="sm"
        variant="ghost"
        @click="isShareModalOpen = true"
      >
        Share
      </UButton>
      
            <UButton
        icon="i-heroicons-arrow-down-tray"
        size="sm"
        variant="ghost"
        @click="handleExport"
      >
        Export
      </UButton>
      
      <UButton
        icon="i-heroicons-view-columns"
        size="sm"
        variant="ghost"
        @click="toggleRightPanel"
      >
        Toggle Panel
      </UButton>
    </div>

    <!-- Share modal -->
    <UModal v-model="isShareModalOpen">
      <UCard>
        <template #header>
          <h3>Share Chat</h3>
        </template>
        
        <div class="flex flex-col gap-4">
          <p>Share link functionality coming soon...</p>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="soft" @click="isShareModalOpen = false">
              Cancel
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>

</template>