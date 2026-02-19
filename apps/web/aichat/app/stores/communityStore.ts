import { defineStore } from 'pinia';
import type { CommunityWorkflow } from '~/shared/types/community';

interface CommunityState {
  workflows: CommunityWorkflow[];
  isLoading: boolean;
}

const mockWorkflows: CommunityWorkflow[] = [
  {
    id: 'wf-1',
    name: 'Daily Standup Reporter',
    author: 'Jane Doe',
    description:
      'Automatically gathers updates from Slack, Jira, and GitHub and drafts a daily standup report.',
    downloads: 1250,
    rating: 4.8,
    version: '1.2.0',
    actions: [{ type: 'Fetch Slack' }, { type: 'Fetch Jira' }, { type: 'Format Text' }],
  },
  {
    id: 'wf-2',
    name: 'Social Media Publisher',
    author: 'John Smith',
    description:
      'Takes a blog post URL, summarizes it using AI, and schedules posts for Twitter and LinkedIn.',
    downloads: 850,
    rating: 4.5,
    version: '1.0.0',
    actions: [{ type: 'Summarize URL' }, { type: 'Post to Twitter' }],
  },
];

export const useCommunityStore = defineStore('community', {
  state: (): CommunityState => ({
    workflows: [],
    isLoading: false,
  }),
  actions: {
    async fetchWorkflows() {
      this.isLoading = true;
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      this.workflows = mockWorkflows;
      this.isLoading = false;
    },
    async fetchWorkflowById(id: string): Promise<CommunityWorkflow | null> {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 200));
      const workflow = mockWorkflows.find(w => w.id === id) || null;
      this.isLoading = false;
      return workflow;
    },
  },
});
