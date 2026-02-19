<script setup>

import { ref, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'

// NOTE TO USER: To make this component work, you need to install 'monaco-editor'.
// Run: bun add monaco-editor
// You may also need to configure Vite to handle the web workers, for example using `vite-plugin-monaco-editor`

const props = defineProps({
  modelValue: String,
  language: String,
})

const editorContainer = ref(null)
let editor = null

onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue || '',
      language: props.language || 'plaintext',
      theme: 'vs-dark',
      automaticLayout: true,
    })

    editor.onDidChangeModelContent(() => {
      emit('update:modelValue', editor.getValue())
    })
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue || '')
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), newLanguage || 'plaintext')
  }
})


</script>

<template>

  <div ref="editorContainer" class="w-full h-full"></div>

</template>

<style>

/* Set a default height for the editor container if it's not set by the parent */
.monaco-editor {
  min-height: 500px;
}

</style>