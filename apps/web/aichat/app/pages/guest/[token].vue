<script setup lang="ts">

const route = useRoute();
const token = route.params.token as string;

const { data: inviteDetails, error } = await useFetch(`/api/invites/guest/${token}`);

const chatSessionId = computed(() => inviteDetails.value?.chatSessionId);

// TODO: Fetch and display the chat session using the chatSessionId
// You can use a similar component to the main chat view but in a read-only mode.


</script>

<template>

  <div class="guest-view p-4">
    <div v-if="error" class="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error.data?.statusMessage || 'Could not validate invite.' }}</span>
    </div>
    <div v-else-if="chatSessionId">
      <h1 class="text-2xl font-bold mb-4">Guest View</h1>
      <p class="mb-4">You are viewing a shared chat session.</p>
      <!-- Chat display component will go here -->
      <div>Chat Session ID: {{ chatSessionId }}</div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>

</template>