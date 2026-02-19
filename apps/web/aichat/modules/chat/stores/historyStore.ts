import { defineStore } from 'pinia';
import type { ActionHistoryItem } from '~/shared/types/history';

interface HistoryState {
  history: ActionHistoryItem[];
}

// Mock initial state
const mockHistory: ActionHistoryItem[] = [
  {
    id: 'hist-1',
    timestamp: Date.now() - 20000,
    status: 'executed',
    action: { type: 'Navigate', details: 'Opened google.com' },
  },
  {
    id: 'hist-2',
    timestamp: Date.now() - 10000,
    status: 'executed',
    action: { type: 'Type', details: 'Typed \'AI Agents\' into search bar' },
  },
  {
    id: 'hist-3',
    timestamp: Date.now() - 5000,
    status: 'executed',
    action: { type: 'Click', details: 'Clicked Search button' },
  },
];

export const useHistoryStore = defineStore('history', {
  state: (): HistoryState => ({
    history: [...mockHistory],
  }),
  actions: {
    addAction(item: Omit<ActionHistoryItem, 'id' | 'timestamp' | 'status'>) {
      const newEntry: ActionHistoryItem = {
        ...item,
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        status: 'executed',
      };
      this.history.unshift(newEntry); // Add to the top of the list
    },
    undoAction(actionId: string) {
      const item = this.history.find(i => i.id === actionId);
      if (item && item.status === 'executed') {
        console.log(`Undoing action: ${item.action.type}`);
        // In a real app, this would trigger a call to the agent backend
        // to perform the rollback logic.
        item.status = 'undone';
      }
    },
  },
});
