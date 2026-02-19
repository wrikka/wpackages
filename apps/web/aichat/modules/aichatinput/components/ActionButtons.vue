<script setup lang="ts">
interface Props {
  isLoading: boolean
  isDisabled: boolean
  message: string
  selectedModeId: any
  selectedModel: any
  enabledModes: any[]
  availableModels: any[]
  onFileSelect: () => void
  onOpenCommandMenu: () => void
  onStop: () => void
  onSend: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="action-buttons flex items-center justify-between p-2 border-t">
    <div class="flex items-center gap-2">
      <UButton size="sm" color="gray" variant="ghost" @click="onFileSelect">
        <UIcon name="i-heroicons-paper-clip" />
      </UButton>
      
      <UButton size="sm" color="gray" variant="ghost" @click="onOpenCommandMenu">
        <UIcon name="i-heroicons-slash" />
      </UButton>
    </div>

    <div class="flex items-center gap-2">
      <USelect
        v-model="selectedModeId"
        :options="enabledModes"
        option-attribute="name"
        value-attribute="id"
        size="sm"
      />
      
      <USelect
        v-model="selectedModel"
        :options="availableModels"
        size="sm"
      />

      <UButton
        v-if="isLoading"
        color="red"
        variant="soft"
        @click="onStop"
      >
        Stop
      </UButton>
      
      <UButton
        v-else
        :disabled="!message.trim() || isDisabled"
        @click="onSend"
      >
        Send
      </UButton>
    </div>
  </div>
</template>
