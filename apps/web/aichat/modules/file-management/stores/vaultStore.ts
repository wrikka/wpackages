import { defineStore } from 'pinia';
import type { VaultItem } from '~/shared/types/vault';

interface VaultState {
  items: VaultItem[];
  isLoading: boolean;
}

const mockItems: VaultItem[] = [
  {
    id: 'vault-1',
    name: 'OpenAI API Key',
    type: 'api_key',
    value: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    id: 'vault-2',
    name: 'Jira Login',
    type: 'password',
    value: 'MySuperSecretPassword123',
  },
];

export const useVaultStore = defineStore('vault', {
  state: (): VaultState => ({
    items: [],
    isLoading: false,
  }),
  actions: {
    async loadItems() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 300));
      this.items = mockItems;
      this.isLoading = false;
    },
    addItem(item: Omit<VaultItem, 'id'>) {
      const newItem: VaultItem = {
        ...item,
        id: `vault-${Date.now()}`,
      };
      this.items.push(newItem);
      // In a real app, this would be an encrypted call to a secure backend
      console.log('Adding new item:', newItem);
    },
    deleteItem(itemId: string) {
      this.items = this.items.filter(item => item.id !== itemId);
      console.log('Deleting item:', itemId);
    },
  },
});
