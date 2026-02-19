<script setup lang="ts">


interface Suggestion {
  packageName: string;
  currentVersion?: string;
  latestVersion?: string;
  suggestion: string;
  notes?: string;
}
interface DependencyReportData {
  type: 'dependency_report';
  suggestions: Suggestion[];
}
defineProps<{ 
  summary: DependencyReportData 
}>();
const getSuggestionClass = (suggestion: string) => {
  if (suggestion.toLowerCase().includes('vulnerability')) {
    return 'bg-red-100 text-red-800';
  }
  if (suggestion.toLowerCase().includes('update')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-gray-100 text-gray-800';
};

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Dependency Analysis Report</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-2">Package</th>
            <th scope="col" class="px-4 py-2">Current</th>
            <th scope="col" class="px-4 py-2">Latest</th>
            <th scope="col" class="px-4 py-2">Suggestion</th>
            <th scope="col" class="px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in summary.suggestions" :key="index" class="bg-white border-b">
            <td class="px-4 py-2 font-medium text-gray-900">{{ item.packageName }}</td>
            <td class="px-4 py-2">{{ item.currentVersion }}</td>
            <td class="px-4 py-2">{{ item.latestVersion }}</td>
            <td class="px-4 py-2">
              <span :class="['px-2 py-1 text-xs font-semibold rounded-full', getSuggestionClass(item.suggestion)]">
                {{ item.suggestion }}
              </span>
            </td>
            <td class="px-4 py-2">{{ item.notes }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>