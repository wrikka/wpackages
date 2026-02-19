<script setup lang="ts">

import { useDebounceFn } from '@vueuse/core';

const sessionsStore = useSessionsStore();
const query = ref('');
const search = async () => {
  await sessionsStore.searchSessions(query.value);
};
const debouncedSearch = useDebounceFn(search, 300);
const clearSearch = () => {
  query.value = '';
  sessionsStore.clearSearch();
};
watch(() => sessionsStore.searchTerm, (newTerm) => {
  if (query.value !== newTerm) {
    query.value = newTerm || '';
  }
});

</script>

<template>

  <div class="relative">
    <UInput
      v-model="query"
      placeholder="Search in conversations..."
      icon="i-carbon-search"
      @input="debouncedSearch"
    />
    <UButton
      v-if="query"
      icon="i-carbon-close"
      color="gray"
      variant="link"
      class="absolute top-1/2 right-2 -translate-y-1/2"
      @click="clearSearch"
    />
  </div>

</template>