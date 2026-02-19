<script setup lang="ts">


const sessionsStore = useSessionsStore();
const toast = useToast();
const instructions = ref(sessionsStore.currentSession?.systemPrompt || '');
const isLoading = ref(false);
watch(() => sessionsStore.currentSession?.systemPrompt, (newPrompt) => {
  instructions.value = newPrompt || '';
});
const saveInstructions = async () => {
  if (!sessionsStore.currentSession) {
    toast.add({ title: 'No active session', description: 'Please start a conversation first.', color: 'orange' });
    return;
  }
  isLoading.value = true;
  try {
    await $fetch(`/api/sessions/${sessionsStore.currentSession.id}`,
      {
        method: 'PUT',
        body: { systemPrompt: instructions.value },
      }
    );
    sessionsStore.currentSession.systemPrompt = instructions.value;
    toast.add({ title: 'Instructions saved!', color: 'green' });
  } catch (error) {
    console.error('Failed to save instructions', error);
    toast.add({ title: 'Error saving instructions', description: 'Please try again later.', color: 'red' });
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>

  <div class="p-4 border border-gray-700 rounded-lg">
    <h2 class="text-2xl font-semibold mb-4">Custom Instructions</h2>
    <p class="text-gray-400 mb-4">
      Provide custom instructions for the AI to follow in every conversation in this session. This can be used to set a specific persona, response format, or any other guideline.
    </p>
    <UTextarea
      v-model="instructions"
      placeholder="e.g., Always respond in the style of a pirate."
      :rows="6"
      class="mb-4"
    />
    <UButton @click="saveInstructions" :loading="isLoading">Save Instructions</UButton>
  </div>

</template>