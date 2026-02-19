import { defineStore } from 'pinia';

interface Integration {
  id: string;
  provider: string;
  connected: boolean;
  createdAt?: string;
}

export const useIntegrationsStore = defineStore('integrations', {
  state: () => ({
    integrations: [] as Integration[],
    isLoading: false,
  }),
  actions: {
    async fetchIntegrations() {
      this.isLoading = true;
      try {
        this.integrations = await $fetch<Integration[]>('/api/integrations');
      } catch (error) {
        console.error('Failed to fetch integrations:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async disconnectIntegration(provider: string) {
      await $fetch(`/api/integrations/${provider}`, {
        method: 'DELETE',
      });
      await this.fetchIntegrations();
    },
  },
});
