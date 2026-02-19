<script setup lang="ts">


interface EvidenceItem {
  title: string;
  snippet: string;
  url: string | null;
}
interface FactCheckSummary {
  type: 'fact_check_summary';
  claim: string;
  verdict: string;
  confidence: number;
  evidence: EvidenceItem[];
}
defineProps<{ summary: FactCheckSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Fact Check</h3>
    <p class="text-sm text-gray-700"><strong>Claim:</strong> {{ summary.claim }}</p>
    <p class="mt-2 text-sm text-gray-700"><strong>Verdict:</strong> {{ summary.verdict }}</p>
    <p class="mt-1 text-sm text-gray-700"><strong>Confidence:</strong> {{ summary.confidence }}%</p>

    <div v-if="summary.evidence?.length" class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Evidence</h4>
      <ul class="mt-2 space-y-2">
        <li v-for="(ev, idx) in summary.evidence" :key="idx" class="p-2 bg-gray-50 rounded">
          <p class="text-sm font-medium text-gray-800">{{ ev.title }}</p>
          <p class="text-xs text-gray-600">{{ ev.snippet }}</p>
          <a v-if="ev.url" :href="ev.url" target="_blank" class="text-xs text-blue-600 hover:underline">{{ ev.url }}</a>
        </li>
      </ul>
    </div>
  </div>

</template>