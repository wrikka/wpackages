import { defineStore } from 'pinia';
import type { AgentAction } from '~/shared/types/correction';

interface CorrectionState {
  isActive: boolean;
  pausedAction: AgentAction | null;
}

export const useCorrectionStore = defineStore('correction', {
  state: (): CorrectionState => ({
    isActive: false,
    pausedAction: null,
  }),
  actions: {
    // Called by the agent when it needs to pause for correction
    activate(actionToCorrect: AgentAction) {
      this.isActive = true;
      this.pausedAction = actionToCorrect;
      console.log('Correction mode activated for action:', actionToCorrect);
    },
    deactivate() {
      this.isActive = false;
      this.pausedAction = null;
    },
  },
});
