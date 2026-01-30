import { inject, provide } from "vue";
import { QueryClient } from "../client";
import type { InjectionKey } from "vue";

export const QueryClientKey: InjectionKey<QueryClient> = Symbol("QueryClient");

export function provideQueryClient(client: QueryClient) {
  provide(QueryClientKey, client);
}

export function useQueryClient(): QueryClient {
  const client = inject(QueryClientKey);
  if (!client) {
    throw new Error(
      "No QueryClient found. Make sure to wrap your app with a QueryClientProvider.",
    );
  }
  return client;
}
