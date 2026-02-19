<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface MessageFlowAnimationProps {
  isStreaming?: boolean
  content?: string
  typingSpeed?: number
  showCursor?: boolean
}

const props = withDefaults(defineProps<MessageFlowAnimationProps>(), {
  isStreaming: false,
  content: '',
  typingSpeed: 30,
  showCursor: true
})

const displayedContent = ref('')
const isTyping = ref(false)
const showTypingCursor = ref(false)
const typingTimer = ref<NodeJS.Timeout | null>(null)
const cursorTimer = ref<NodeJS.Timeout | null>(null)

// Computed properties
const shouldShowTypingEffect = computed(() => {
  return props.isStreaming && props.content.length > 0
})

const displayContent = computed(() => {
  return shouldShowTypingEffect.value ? displayedContent.value : props.content
})

// Methods
const startTypingAnimation = () => {
  if (!shouldShowTypingEffect.value) return
  
  isTyping.value = true
  displayedContent.value = ''
  let currentIndex = 0
  
  const typeNextChar = () => {
    if (currentIndex < props.content.length && isTyping.value) {
      displayedContent.value += props.content[currentIndex]
      currentIndex++
      typingTimer.value = setTimeout(typeNextChar, props.typingSpeed)
    } else {
      isTyping.value = false
      displayedContent.value = props.content
    }
  }
  
  typeNextChar()
}

const stopTypingAnimation = () => {
  isTyping.value = false
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
  displayedContent.value = props.content
}

const startCursorAnimation = () => {
  if (!props.showCursor) return
  
  showTypingCursor.value = true
  const toggleCursor = () => {
    showTypingCursor.value = !showTypingCursor.value
    cursorTimer.value = setTimeout(toggleCursor, 500)
  }
  toggleCursor()
}

const stopCursorAnimation = () => {
  if (cursorTimer.value) {
    clearTimeout(cursorTimer.value)
    cursorTimer.value = null
  }
  showTypingCursor.value = false
}

// Watchers
watch(() => props.content, (newContent) => {
  if (shouldShowTypingEffect.value) {
    startTypingAnimation()
  } else {
    stopTypingAnimation()
    displayedContent.value = newContent
  }
}, { immediate: true })

watch(() => props.isStreaming, (isStreaming) => {
  if (isStreaming) {
    startTypingAnimation()
    startCursorAnimation()
  } else {
    stopTypingAnimation()
    stopCursorAnimation()
  }
})

// Lifecycle
onMounted(() => {
  if (shouldShowTypingEffect.value) {
    startTypingAnimation()
    startCursorAnimation()
  }
})

onUnmounted(() => {
  stopTypingAnimation()
  stopCursorAnimation()
})
</script>

<template>
  <div class="message-flow-animation">
    <!-- Typing Indicator -->
    <div v-if="isStreaming && !displayContent" class="typing-indicator flex items-center gap-1 px-3 py-2">
      <div class="flex gap-1">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
      <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">AI is typing...</span>
    </div>
    
    <!-- Streaming Content -->
    <div v-else class="streaming-content relative">
      <div class="content-wrapper">
        <slot :content="displayContent" :is-typing="isTyping">
          {{ displayContent }}
        </slot>
      </div>
      
      <!-- Typing Cursor -->
      <span 
        v-if="showCursor && (isTyping || isStreaming)"
        class="typing-cursor inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse"
        :class="{ 'opacity-0': !showTypingCursor }"
      ></span>
    </div>
    
    <!-- Streaming Progress Bar -->
    <div v-if="isStreaming" class="streaming-progress absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div class="progress-bar h-full bg-blue-500 rounded-full animate-pulse" style="width: 60%; animation: shimmer 2s infinite;"></div>
    </div>
  </div>
</template>

<style scoped>
.message-flow-animation {
  position: relative;
}

.typing-indicator {
  background-color: rgba(249, 250, 251, 1);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.dark .typing-indicator {
  background-color: rgba(31, 41, 55, 1);
}

.streaming-content {
  position: relative;
}

.content-wrapper {
  display: inline-block;
}

.typing-cursor {
  opacity: 1;
  transition: opacity 0.15s;
}

.typing-cursor.opacity-0 {
  opacity: 0;
}

.streaming-progress {
  margin-top: 0.5rem;
  height: 0.125rem;
  background-color: rgba(229, 231, 235, 1);
  border-radius: 9999px;
  overflow: hidden;
}

.dark .streaming-progress {
  background-color: rgba(55, 65, 81, 1);
}

.progress-bar {
  height: 100%;
  background-color: rgba(59, 130, 246, 1);
  border-radius: 9999px;
  width: 60%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>
