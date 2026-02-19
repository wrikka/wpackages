import { defineStore } from 'pinia';
import type { KnowledgeGraph } from '~/shared/types/knowledge';

interface KnowledgeGraphState {
  graph: KnowledgeGraph;
  isLoading: boolean;
}

const mockGraph: KnowledgeGraph = {
  nodes: [
    { id: 'user', label: 'Current User', type: 'Person', color: '#be185d' },
    { id: 'wf1', label: 'Daily Report', type: 'Workflow', color: '#059669' },
    { id: 'app_excel', label: 'Excel', type: 'Application', color: '#15803d' },
    { id: 'app_slack', label: 'Slack', type: 'Application', color: '#4f46e5' },
    { id: 'file_report', label: 'report.xlsx', type: 'File', color: '#ca8a04' },
    { id: 'concept_sales', label: 'Sales Data', type: 'Concept', color: '#4b5563' },
  ],
  edges: [
    { id: 'e1', source: 'user', target: 'wf1', label: 'OWNS' },
    { id: 'e2', source: 'wf1', target: 'app_excel', label: 'USES' },
    { id: 'e3', source: 'wf1', target: 'app_slack', label: 'USES' },
    { id: 'e4', source: 'app_excel', target: 'file_report', label: 'MODIFIES' },
    { id: 'e5', source: 'file_report', target: 'concept_sales', label: 'CONTAINS' },
  ],
};

export const useKnowledgeGraphStore = defineStore('knowledgeGraph', {
  state: (): KnowledgeGraphState => ({
    graph: { nodes: [], edges: [] },
    isLoading: false,
  }),
  actions: {
    async fetchGraphData() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 300));
      this.graph = mockGraph;
      this.isLoading = false;
    },
  },
});
