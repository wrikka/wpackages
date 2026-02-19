<script setup lang="ts">


interface TrendAnalysisSummaryData {
  type: 'trend_analysis_summary';
  topic: string;
  trend: string;
  forecast: string;
  confidence: number;
}
defineProps<{ 
  summary: TrendAnalysisSummaryData 
}>();
const getTrendColor = (trend: string) => {
  switch (trend.toLowerCase()) {
    case 'increasing': return 'text-green-600';
    case 'decreasing': return 'text-red-600';
    case 'stable': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Trend Analysis & Forecasting: {{ summary.topic }}</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-3 bg-gray-50 rounded-md">
        <p class="text-sm font-medium text-gray-700">Current Trend:</p>
        <p class="text-xl font-bold mt-1" :class="getTrendColor(summary.trend)">{{ summary.trend }}</p>
      </div>
      <div class="p-3 bg-gray-50 rounded-md">
        <p class="text-sm font-medium text-gray-700">Confidence:</p>
        <p class="text-xl font-bold mt-1 text-gray-800">{{ summary.confidence }}%</p>
      </div>
    </div>

    <div class="mt-4">
      <p class="text-sm font-medium text-gray-700">Forecast:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.forecast }}</p>
    </div>
  </div>

</template>