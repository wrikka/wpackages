export type VaultItemType = 'api_key' | 'password' | 'token' | 'other';

export interface VaultItem {
  id: string;
  name: string;
  type: VaultItemType;
  value: string; // This would be encrypted at rest and in transit in a real app
}
