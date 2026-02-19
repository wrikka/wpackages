<script setup lang="ts">


const sessionsStore = useSessionsStore()
const chatUIStore = useChatUIStore()
const isEditingTitle = ref(false)
const newTitle = ref('')
function startEditingTitle() {
  if (sessionsStore.currentSession) {
    newTitle.value = sessionsStore.currentSession.title
    isEditingTitle.value = true
  }
}
async function saveNewTitle() {
  if (sessionsStore.currentSession && newTitle.value.trim()) {
    await sessionsStore.renameSession(sessionsStore.currentSession.id, newTitle.value.trim())
    isEditingTitle.value = false
  }
}
defineExpose({
  startEditingTitle,
  saveNewTitle,
  isEditingTitle,
  newTitle,
})

</script>

<template>

  <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <!-- Session title editing -->
    <div v-if="sessionsStore.currentSession" class="flex-1">
      <div v-if="!isEditingTitle" class="flex items-center gap-2">
        <h2 class="text-lg font-semibold m-0">{{ sessionsStore.currentSession.title }}</h2>
        <UButton
          icon="i-heroicons-pencil"
          size="xs"
          variant="ghost"
          @click="startEditingTitle"
        />
      </div>
      <div v-else class="flex items-center gap-2">
        <UInput
          v-model="newTitle"
          size="sm"
          @keyup.enter="saveNewTitle"
          @keyup.escape="isEditingTitle = false"
        />
        <UButton
          icon="i-heroicons-check"
          size="xs"
          @click="saveNewTitle"
        />
        <UButton
          icon="i-heroicons-x-mark"
          size="xs"
          variant="ghost"
          @click="isEditingTitle = false"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <UButton
        icon="i-heroicons-bars-3"
        size="sm"
        variant="ghost"
        @click="chatUIStore.toggleSidebar"
      />
    </div>
  </div>

</template>