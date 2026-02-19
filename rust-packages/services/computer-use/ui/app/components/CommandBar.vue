<script setup>

import { ref, defineEmits } from 'vue'
import { useLogState } from '~/composables/useLogState'

const command = ref('')
const { addLogEntry } = useLogState()

defineEmits(['show-plan'])

const sendCommand = async () => {
  if (!command.value.trim()) return

  const sentCommand = command.value
  addLogEntry({ status: '➡️', action: `Sent: ${sentCommand}` })

  try {
    const response = await $fetch('/api/command', {
      method: 'POST',
      body: { command: sentCommand }
    })
    addLogEntry({ status: '✅', action: `Rcvd: ${response.output}` })
  } catch (error) {
    console.error('Error sending command:', error)
    addLogEntry({ status: '❌', action: `Error: ${error.message}` })
  }

  command.value = ''
}

</script>

<template>

  <footer class="pt-4">
    <UCard>
      <div class="flex items-center gap-2">
        <span class="text-gray-500 font-mono">&gt;</span>
        <input 
          type="text" 
          class="w-full bg-transparent focus:outline-none"
          placeholder="Enter a command in natural language... (e.g., 'Click the save button')"
          v-model="command"
          @keyup.enter="sendCommand"
        >
        <UButton @click="$emit('show-plan')">Simulate Plan</UButton>
      </div>
    </UCard>
  </footer>

</template>