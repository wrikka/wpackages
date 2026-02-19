<script setup>

import { ref, watch } from 'vue'

const { data: envVars, pending, error, refresh } = await useFetch('/api/env')

const localEnvVars = ref({})
const isDirty = ref(false)

// Clone the fetched data to a local ref for editing
watch(envVars, (newVal) => {
  if (newVal) {
    localEnvVars.value = JSON.parse(JSON.stringify(newVal))
    isDirty.value = false
  }
}, { immediate: true })

function updateKey(index, newKey) {
  const oldKey = Object.keys(localEnvVars.value)[index];
  const value = localEnvVars.value[oldKey];
  delete localEnvVars.value[oldKey];
  localEnvVars.value[newKey] = value;
  isDirty.value = true;
}

function updateValue(key, newValue) {
  localEnvVars.value[key] = newValue;
  isDirty.value = true;
}

function addVar() {
  localEnvVars.value[`NEW_VARIABLE_${Object.keys(localEnvVars.value).length}`] = ''
  isDirty.value = true
}

function removeVar(key) {
  delete localEnvVars.value[key]
  isDirty.value = true
}

async function saveChanges() {
  await $fetch('/api/env', {
    method: 'POST',
    body: localEnvVars.value
  })
  isDirty.value = false
  alert('Changes saved!')
  refresh()
}

</script>

<template>

  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Environment Variables</h1>
      <button @click="saveChanges" class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400" :disabled="!isDirty">Save Changes</button>
    </div>

    <div v-if="pending" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-center text-red-500">Failed to load variables.</div>
    <div v-else class="space-y-3">
      <div v-for="(value, key, index) in localEnvVars" :key="index" class="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
        <input 
          :value="key" 
          @input="updateKey(index, $event.target.value)" 
          class="w-1/3 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-mono"
          placeholder="VARIABLE_NAME"
        />
        <input 
          :value="value" 
          @input="updateValue(key, $event.target.value)" 
          class="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-mono"
          placeholder="value"
        />
        <button @click="removeVar(key)" class="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full">
          <!-- Heroicon: trash -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      
      <button @click="addVar" class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">+ Add Variable</button>
    </div>
  </div>

</template>