<script setup lang="ts">


interface FollowUpQuestionsSummaryData {
  type: 'follow_up_questions_summary';
  topic: string;
  questions: string[];
}
defineProps<{ 
  summary: FollowUpQuestionsSummaryData 
}>();
defineEmits(['ask-question']);

</script>

<template>

  <div class="p-4 my-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Follow-up Questions</h3>
    <p class="mb-4 text-sm text-gray-600">Here are some questions you might want to ask next about "<span class="italic">{{ summary.topic }}</span>":</p>
    <div class="space-y-2">
      <div v-for="(question, index) in summary.questions" :key="index" 
           @click="$emit('ask-question', question)"
           class="p-3 text-sm text-blue-700 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-200 transition-colors">
        {{ question }}
      </div>
    </div>
  </div>

</template>