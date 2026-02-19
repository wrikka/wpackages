<script setup lang="ts">


interface StudyWeek {
  week: number;
  focus: string;
  tasks: string[];
}
interface StudyPlanSummary {
  type: 'study_plan_summary';
  goal: string;
  durationDays: number;
  plan: StudyWeek[];
}
defineProps<{ summary: StudyPlanSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Study Plan</h3>
    <p class="text-sm text-gray-700"><strong>Goal:</strong> {{ summary.goal }}</p>
    <p class="text-sm text-gray-700"><strong>Duration:</strong> {{ summary.durationDays }} days</p>

    <div class="mt-3 space-y-2">
      <div v-for="(w, idx) in summary.plan" :key="idx" class="p-3 bg-gray-50 rounded">
        <p class="text-sm font-semibold text-gray-800">Week {{ w.week }} - {{ w.focus }}</p>
        <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
          <li v-for="(t, j) in w.tasks" :key="j">{{ t }}</li>
        </ul>
      </div>
    </div>
  </div>

</template>