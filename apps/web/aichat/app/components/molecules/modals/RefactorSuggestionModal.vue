<script setup lang="ts">

import { useCodeRefactor } from '~/app/composables/chat/useCodeRefactor';

const { isModalOpen, originalCode, suggestedCode, isLoading, applySuggestion: applySuggestionFromComposble } = useCodeRefactor();
function applySuggestion() {
  if (suggestedCode.value) {
    applySuggestionFromComposble(suggestedCode.value);
  }
}

</script>

<template>

  <UModal v-model="isModalOpen">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Code Refactoring Suggestion</h2>
      
</template>