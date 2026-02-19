import { defineStore } from 'pinia';
import type { LiveAgentState } from '~/shared/types/live-agent';

interface StoreState {
  isVisible: boolean;
  currentState: LiveAgentState | null;
}

export const useLiveAgentStore = defineStore('liveAgent', {
  state: (): StoreState => ({
    isVisible: false,
    currentState: null,
  }),
  actions: {
    show() {
      this.isVisible = true;
      // Mock agent state updates
      this.startMockUpdates();
    },
    hide() {
      this.isVisible = false;
      this.stopMockUpdates();
    },
    updateState(newState: LiveAgentState) {
      this.currentState = newState;
    },
    pauseAgent() {
      console.log('Agent paused by user.');
      if (this.currentState) this.currentState.status = 'Paused';
    },
    resumeAgent() {
      console.log('Agent resumed by user.');
      if (this.currentState) this.currentState.status = 'Running';
    },
    stopAgent() {
      console.log('Agent stopped by user.');
      if (this.currentState) this.currentState.status = 'Stopped';
      this.hide();
    },
    // MOCK DATA GENERATION
    startMockUpdates() {
      if (this.mockInterval) return;
      this.mockInterval = setInterval(() => {
        if (!this.isVisible) return;
        this.updateState({
          status: 'Running',
          currentAction: 'Clicking the \'Login\' button.',
          screenshotUrl: 'https://placehold.co/640x360.png',
          targetElementBounds: {
            x: Math.random() * 400 + 50, // Random position for demo
            y: Math.random() * 200 + 50,
            width: 120,
            height: 40,
          },
        });
      }, 2000);
    },
    stopMockUpdates() {
      if (this.mockInterval) {
        clearInterval(this.mockInterval);
        this.mockInterval = null;
      }
    },
  },
  // Add a non-state property for the interval ID
  // @ts-ignore
  mockInterval: null as NodeJS.Timeout | null,
});
