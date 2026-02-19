import { defineStore } from 'pinia';
import type { Trigger } from '~/shared/types/triggers';

interface SchedulerState {
  triggers: Trigger[];
  isLoading: boolean;
}

const mockTriggers: Trigger[] = [
  {
    id: 'trig-1',
    name: 'Morning News Briefing',
    type: 'schedule',
    description: 'Every weekday at 8:00 AM',
    workflowId: 'wf-news',
    workflowName: 'Fetch and Summarize News',
    enabled: true,
  },
  {
    id: 'trig-2',
    name: 'Process New Invoices',
    type: 'event',
    description: 'When a new file is added to \'Invoices\' folder',
    workflowId: 'wf-invoice',
    workflowName: 'Invoice Processing',
    enabled: false,
  },
];

export const useSchedulerStore = defineStore('scheduler', {
  state: (): SchedulerState => ({
    triggers: [],
    isLoading: false,
  }),
  actions: {
    async loadTriggers() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 200));
      this.triggers = mockTriggers;
      this.isLoading = false;
    },
    addTrigger(trigger: Omit<Trigger, 'id'>) {
      const newTrigger: Trigger = { ...trigger, id: `trig-${Date.now()}` };
      this.triggers.push(newTrigger);
    },
    updateTrigger(id: string, updates: Partial<Trigger>) {
      const trigger = this.triggers.find(t => t.id === id);
      if (trigger) {
        Object.assign(trigger, updates);
      }
    },
    deleteTrigger(id: string) {
      this.triggers = this.triggers.filter(t => t.id !== id);
    },
  },
});
