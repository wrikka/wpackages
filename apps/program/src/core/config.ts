import { createConfigManager, createEnvSource } from '@wts/config-manager';
import type { ApiConfig } from '../features/users/user.types';

// Configuration management for API settings
export const configProvider = createConfigManager<ApiConfig>({
  sources: [createEnvSource('API_')],
  defaults: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  }
});
