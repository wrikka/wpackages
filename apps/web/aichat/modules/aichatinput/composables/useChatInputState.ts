import { ref, computed, watch } from 'vue'
import type { ChatInputProps, ChatInputEmits } from '../types'

export function useChatInputState(props: ChatInputProps, emit: ChatInputEmits) {
  // --- State ---
  const message = ref(props.value || '')
  const isLoading = ref(false)
  const isDisabled = computed(() => Boolean(props.disabled) || isLoading.value)
  const files = ref<File[]>([])

  // --- Watchers ---
  watch(() => props.value, (newValue: any) => {
    if (newValue !== message.value) {
      message.value = newValue
    }
  })

  watch(message, (newValue) => {
    emit('update:value', newValue)
  })

  // --- File handling ---
  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      files.value = Array.from(target.files)
    }
  }

  const removeFile = (index: number) => {
    files.value.splice(index, 1)
  }

  // --- Send handling ---
  const handleSend = async (mode: string, model: string, systemPrompt?: string | null) => {
    if (!message.value.trim() || isLoading.value) return

    isLoading.value = true

    try {
      emit('send', {
        message: message.value,
        files: files.value,
        mode,
        model,
        systemPrompt,
      })

      message.value = ''
      files.value = []
    } finally {
      isLoading.value = false
    }
  }

  const handleStop = () => {
    isLoading.value = false
    emit('stop')
  }

  return {
    // State
    message,
    isLoading,
    isDisabled,
    files,

    // Methods
    handleFileChange,
    removeFile,
    handleSend,
    handleStop,
  }
}
