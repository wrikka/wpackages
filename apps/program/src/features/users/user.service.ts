import { Result, err, tryResult } from '@wts/functional';
import { AppError, appError } from '@wts/error';
import { retryAsync, retryPolicies } from '@wts/resilience';
import { traceAsync } from '@wts/observability';
import type { ConfigManager } from '@wts/config-manager';

import type { User, ApiConfig } from './user.types';

export class UserService {
  constructor(private config: ConfigManager<ApiConfig>) {}

  @traceAsync('get-user')
  async getUser(id: string): Promise<Result<User, AppError>> {
    if (!id) {
      return err(appError('User ID is required', { code: 'INVALID_INPUT' }));
    }

    const apiConfig = await this.config.get();

    return retryAsync(
      async () => {
        // In a real scenario, you would use a proper fetch library
        console.log(`Fetching user from ${apiConfig.baseURL}/users/${id}`);
        const response = await fetch(`${apiConfig.baseURL}/users/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json() as Promise<User>;
      },
      retryPolicies.exponential({ maxRetries: 3 })
    ).pipe(
      tryResult((error) => appError('Failed to fetch user', { cause: error, userId: id }))
    );
  }
}
