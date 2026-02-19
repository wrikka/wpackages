<script setup lang="ts">


const isListening = ref(false)
const showCommands = ref(false)
const voiceCommands = ref([
  { id: '1', phrase: 'New chat', action: 'Create a new chat session' },
  { id: '2', phrase: 'Send message', action: 'Send current message' },
  { id: '3', phrase: 'Clear chat', action: 'Clear current conversation' },
  { id: '4', phrase: 'Search', action: 'Open search' },
  { id: '5', phrase: 'Settings', action: 'Open settings' },
  { id: '6', phrase: 'Go back', action: 'Navigate back' }
])
const toggleListening = () => {
  isListening.value = !isListening.value
  if (isListening.value) {
    showCommands.value = true
    // Start speech recognition
  }
}

</script>

<template>

  <div class="voice-commands">
    <UButton
      size="xs"
      color="gray"
      variant="soft"
      :icon="isListening ? 'i-heroicons-signal' : 'i-heroicons-microphone'"
      :class="{ 'animate-pulse': isListening }"
      @click="toggleListening"
    >
      {{ isListening ? 'Listening...' : 'Voice' }}
    </UButton>

    <UModal v-model="showCommands">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <UIcon name="i-heroicons-microphone" />
            Voice Commands
          </h3>
        
</template>