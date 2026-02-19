<script setup lang="ts">

import InteractiveTutorial from '~/app/components/InteractiveTutorial.vue';
const user = useUser();
const commandPaletteStore = useCommandPaletteStore();
const contentGenerationStore = useContentGenerationStore();
const { isModalOpen: isRefactorModalOpen } = useCodeRefactor();

// Fetch user on initial load
const { data } = await useFetch('/api/user');
if (data.value) {
  user.value = data.value;
}

defineShortcuts({
  'ctrl+k': {
    handler: () => commandPaletteStore.toggle(),
  },
  'meta+k': {
    handler: () => commandPaletteStore.toggle(),
  },
});

</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
    <CommandPalette />
    <FolderShareModal />
    <ContentGenerationModal v-model:is-open="contentGenerationStore.isModalOpen" />
    <RefactorSuggestionModal v-model="isRefactorModalOpen" />
    <InteractiveTutorial />
  </UApp>
</template>