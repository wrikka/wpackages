<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
const quizTab = ref<'questions' | 'answers'>('questions')
const quizParts = computed(() => {
  const text = normalize(props.content)
  const idx = text.toLowerCase().indexOf('answer key')
  if (idx === -1) {
    return { questions: text.trim(), answers: '' }
  }
  return {
    questions: text.slice(0, idx).trim(),
    answers: text.slice(idx).trim(),
  }
})

</script>

<template>

  <div class="space-y-2">
    <div class="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
      <button
        type="button"
        class="px-3 py-1.5 text-sm"
        :class="quizTab === 'questions' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        @click="quizTab = 'questions'"
      >
        Questions
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-sm border-l border-gray-200"
        :class="quizTab === 'answers' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
        @click="quizTab = 'answers'"
      >
        Answer key
      </button>
    </div>

    <div class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer v-if="quizTab === 'questions'" :content="quizParts.questions" />
      <MarkdownRenderer v-else :content="quizParts.answers || 'No answer key found in the response.'" />
    </div>
  </div>

</template>