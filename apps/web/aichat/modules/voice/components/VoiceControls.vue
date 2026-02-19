<script setup lang="ts">


const props = defineProps<{
  text?: string
  conversationId?: string
}>()
const emit = defineEmits<{
  transcribe: [text: string]
  speak: [text: string]
}>()
const isRecording = ref(false)
const transcript = ref('')
const showTranscript = ref(false)
const recognition = ref<SpeechRecognition | null>(null)
onMounted(() => {
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition.value = new SpeechRecognition()
    recognition.value.continuous = true
    recognition.value.interimResults = true
    recognition.value.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      transcript.value = finalTranscript
    }
    recognition.value.onerror = () => {
      isRecording.value = false
    }
    recognition.value.onend = () => {
      isRecording.value = false
      if (transcript.value) {
        showTranscript.value = true
      }
    }
  }
})
const toggleRecording = () => {
  if (!recognition.value) {
    alert('Speech recognition is not supported in your browser')
    return
  }
  if (isRecording.value) {
    recognition.value.stop()
    isRecording.value = false
  } else {
    transcript.value = ''
    recognition.value.start()
    isRecording.value = true
    showTranscript.value = true
  }
}
const useTranscript = () => {
  emit('transcribe', transcript.value)
  showTranscript.value = false
  transcript.value = ''
}
const speakText = async () => {
  if (!props.text) return
  try {
    const response = await $fetch('/api/ai/speech', {
      method: 'POST',
      body: { text: props.text },
    })
    const audioBlob = new Blob([response as Blob], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.play()
    emit('speak', props.text)
  } catch (error) {
    console.error('TTS failed:', error)
  }
}

</script>

<template>

  <div class="voice-controls">
    <div class="flex items-center gap-2">
      <VoiceButton
        icon="lucide:mic"
        tooltip="Voice Input"
        :is-active="isRecording"
        @click="toggleRecording"
      />
      <VoiceButton
        icon="lucide:volume-2"
        tooltip="Text to Speech"
        :disabled="!text"
        @click="speakText"
      />
    </div>
    
    <Modal v-model="showTranscript" width="md">
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">Voice Input</h3>
        
</template>