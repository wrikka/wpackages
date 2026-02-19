<script setup lang="ts">


interface CommitMessageSummary {
  type: 'commit_message_summary';
  suggestions: string[];
}
defineProps<{ summary: CommitMessageSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Commit Message Suggestions</h3>

    <div class="mt-2 space-y-2">
      <div v-for="(s, idx) in summary.suggestions" :key="idx" class="p-3 bg-gray-50 rounded">
        <code class="text-sm text-gray-900">{{ s }}</code>
      </div>
    </div>
  </div>

</template>