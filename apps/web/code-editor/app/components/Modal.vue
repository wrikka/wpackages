<script setup>

import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  type: { type: String, default: 'alert' }, // alert, confirm, prompt
  title: String,
  message: String,
  initialValue: { type: String, default: '' },
  confirmText: { type: String, default: 'OK' },
  confirmClass: { type: String, default: 'bg-blue-500 hover:bg-blue-600' },
})

const emit = defineEmits(['confirm', 'cancel'])

const inputValue = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    inputValue.value = props.initialValue
  }
})

function confirm() {
  if (props.type === 'prompt') {
    emit('confirm', inputValue.value)
  } else {
    emit('confirm')
  }
}

function cancel() {
  emit('cancel')
}

</script>

<template>

  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
      <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
      <div class="mb-4">
        <p v-if="message">{{ message }}</p>
        <input 
          v-if="type === 'prompt'" 
          v-model="inputValue" 
          @keyup.enter="confirm"
          class="mt-2 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      <div class="flex justify-end space-x-2">
        <button @click="cancel" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
        <button @click="confirm" class="px-4 py-2 rounded text-white" :class="confirmClass">{{ confirmText }}</button>
      </div>
    </div>
  </div>

</template>