import { defineStore } from 'pinia';
import type { PromptRequest, PromptResponse } from '~/shared/types/prompts';

interface PromptState {
  requestQueue: PromptRequest[];
  currentRequest: PromptRequest | null;
  responseMap: Map<string, (response: PromptResponse) => void>;
}

export const usePromptStore = defineStore('humanInTheLoop', {
  state: (): PromptState => ({
    requestQueue: [],
    currentRequest: null,
    responseMap: new Map(),
  }),
  actions: {
    // This would be called by the agent backend via WebSocket or similar
    addRequest(request: Omit<PromptRequest, 'id'>): Promise<PromptResponse> {
      const id = `prompt-${Date.now()}`;
      const newRequest: PromptRequest = { ...request, id };

      const promise = new Promise<PromptResponse>((resolve) => {
        this.responseMap.set(id, resolve);
      });

      this.requestQueue.push(newRequest);
      this.processQueue();

      return promise;
    },
    processQueue() {
      if (this.currentRequest || this.requestQueue.length === 0) {
        return;
      }
      this.currentRequest = this.requestQueue.shift() || null;
    },
    resolveRequest(id: string, selectedOption: string) {
      const resolver = this.responseMap.get(id);
      if (resolver) {
        resolver({ requestId: id, selectedOption });
        this.responseMap.delete(id);
      }
      this.currentRequest = null;
      this.processQueue();
    },
  },
});
