<script setup lang="ts">

import { ref, onMounted } from 'vue'

interface Props {
  selectedText?: string
  onClose?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  selectedText: '',
  onClose: () => {}
})

const selectedText = ref(props.selectedText)
const aiResponse = ref('Click "Process with AI" to analyze the selected text.')
const isLoading = ref(false)

const handleClose = () => {
  props.onClose?.()
}

const processText = async () => {
  if (!selectedText.value.trim()) return
  
  isLoading.value = true
  
  // Simulate AI processing
  setTimeout(() => {
    aiResponse.value = `This is an AI analysis of: "${selectedText.value}". In a real implementation, this would connect to an AI service.`
    isLoading.value = false
  }, 1500)
}

onMounted(() => {
  // Focus on the modal when mounted
  document.querySelector('.modal-content')?.scrollIntoView({ behavior: 'smooth' })
})

</script>

<template>

  <div class="ai-modal-container">
    <div class="modal-overlay" @click="handleClose">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h2>Wai AI Assistant</h2>
          <button class="close-btn" @click="handleClose">&times;</button>
        </header>
        <main class="modal-body">
          <div class="selected-text" v-if="selectedText">
            <p><strong>Selected Text:</strong></p>
            <p class="text-content">{{ selectedText }}</p>
          </div>
          <div class="ai-response">
            <p><strong>AI Response:</strong></p>
            <div class="response-content">
              <p v-if="isLoading">Processing...</p>
              <p v-else>{{ aiResponse }}</p>
            </div>
          </div>
        </main>
        <footer class="modal-footer">
          <button class="action-btn" @click="processText">Process with AI</button>
        </footer>
      </div>
    </div>
  </div>

</template>

<style scoped>

.ai-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.selected-text {
  margin-bottom: 1.5rem;
}

.selected-text p:first-child {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #374151;
}

.text-content {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 0;
  color: #4b5563;
  font-style: italic;
}

.ai-response p:first-child {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #374151;
}

.response-content {
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  min-height: 60px;
  color: #1e40af;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #2563eb;
}

.action-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

</style>