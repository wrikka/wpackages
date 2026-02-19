import { defineStore } from 'pinia';
import type { AnalyticsData } from '~/shared/types/analytics';

interface AnalyticsState {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
}

const mockData: AnalyticsData = {
  keyMetrics: {
    timeSaved: { name: 'Time Saved', value: '12.5', unit: 'hours', change: '+15%' },
    tasksCompleted: { name: 'Tasks Completed', value: '84', change: '+5' },
    errorsPrevented: { name: 'Errors Prevented', value: '12', change: '+2' },
    successRate: { name: 'Success Rate', value: '98', unit: '%', change: '-1%' },
  },
  workflowUsage: {
    labels: ['Daily Report', 'Social Media Post', 'New Project Setup', 'Invoice Processing'],
    datasets: [
      { label: 'Executions', data: [120, 95, 50, 30] },
    ],
  },
  recentActivities: [
    { id: 'act-1', description: 'Ran workflow \'Daily Report\'.', timestamp: '5 minutes ago' },
    {
      id: 'act-2',
      description: 'Corrected action: Clicked wrong button.',
      timestamp: '1 hour ago',
    },
    {
      id: 'act-3',
      description: 'Installed new workflow from community.',
      timestamp: '3 hours ago',
    },
  ],
};

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    analyticsData: null,
    isLoading: false,
  }),
  actions: {
    async fetchAnalytics() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      this.analyticsData = mockData;
      this.isLoading = false;
    },
  },
});
