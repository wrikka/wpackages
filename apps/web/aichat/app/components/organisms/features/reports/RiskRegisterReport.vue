<script setup lang="ts">


interface RiskItem {
  id: string;
  risk: string;
  likelihood: string;
  impact: string;
  mitigation: string;
}
interface RiskRegisterSummary {
  type: 'risk_register_summary';
  context: string;
  risks: RiskItem[];
}
defineProps<{ summary: RiskRegisterSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Risk Register</h3>
    <p class="text-sm text-gray-700"><strong>Context:</strong> {{ summary.context }}</p>

    <div class="mt-3 space-y-2">
      <div v-for="(r, idx) in summary.risks" :key="idx" class="p-3 bg-gray-50 rounded">
        <p class="text-sm font-semibold text-gray-800">{{ r.risk }}</p>
        <p class="text-xs text-gray-700">Likelihood: {{ r.likelihood }} | Impact: {{ r.impact }}</p>
        <p class="mt-2 text-xs text-green-800"><strong>Mitigation:</strong> {{ r.mitigation }}</p>
      </div>
    </div>
  </div>

</template>