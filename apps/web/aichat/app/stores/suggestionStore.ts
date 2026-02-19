import { defineStore } from 'pinia';
import type { Suggestion } from '~/shared/types/suggestions';

interface SuggestionState {
  suggestionQueue: Suggestion[];
  currentSuggestion: Suggestion | null;
}

export const useSuggestionStore = defineStore('suggestions', {
  state: (): SuggestionState => ({
    suggestionQueue: [],
    currentSuggestion: null,
  }),
  actions: {
    // Called by the agent backend to queue a new suggestion
    queueSuggestion(suggestion: Omit<Suggestion, 'id'>) {
      const newSuggestion: Suggestion = {
        ...suggestion,
        id: `sug-${Date.now()}`,
      };
      this.suggestionQueue.push(newSuggestion);
      this.showNextSuggestion();
    },
    showNextSuggestion() {
      if (this.currentSuggestion || this.suggestionQueue.length === 0) {
        return;
      }
      this.currentSuggestion = this.suggestionQueue.shift() || null;
    },
    acceptSuggestion(id: string) {
      console.log(`User accepted suggestion: ${id}`);
      // TODO: Logic to create a new workflow based on the suggestion
      this.currentSuggestion = null;
      this.showNextSuggestion();
    },
    dismissSuggestion(id: string) {
      console.log(`User dismissed suggestion: ${id}`);
      this.currentSuggestion = null;
      this.showNextSuggestion();
    },
  },
});
