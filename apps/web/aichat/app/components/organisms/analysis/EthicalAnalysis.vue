<script setup lang="ts">


interface EthicalAnalysisSummaryData {
  type: 'ethical_analysis_summary';
  topic: string;
  potentialBiases: string[];
  ethicalConcerns: string[];
  mitigationStrategies: string[];
}
defineProps<{ 
  summary: EthicalAnalysisSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Ethical Bias & Impact Analysis: {{ summary.topic }}</h3>
    
    <div class="space-y-4">
      <div>
        <h4 class="text-sm font-semibold text-red-700">Potential Biases</h4>
        <ul class="mt-2 text-xs list-disc list-inside text-red-600 space-y-1">
          <li v-for="(bias, index) in summary.potentialBiases" :key="index">{{ bias }}</li>
        </ul>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-yellow-700">Ethical Concerns</h4>
        <ul class="mt-2 text-xs list-disc list-inside text-yellow-600 space-y-1">
          <li v-for="(concern, index) in summary.ethicalConcerns" :key="index">{{ concern }}</li>
        </ul>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-green-700">Mitigation Strategies</h4>
        <ul class="mt-2 text-xs list-disc list-inside text-green-600 space-y-1">
          <li v-for="(strategy, index) in summary.mitigationStrategies" :key="index">{{ strategy }}</li>
        </ul>
      </div>
    </div>
  </div>

</template>