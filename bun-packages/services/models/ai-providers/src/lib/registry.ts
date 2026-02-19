import type { Provider, ProviderName } from "../types/provider";

type ProviderMap = Readonly<Partial<Record<ProviderName, Provider>>>;

type ProviderWithName<N extends ProviderName> = Provider<N> & { readonly name: N };

type NameOf<P> = P extends ProviderWithName<infer N> ? N : never;

type MergeRecord<R extends Record<PropertyKey, unknown>> = {
  readonly [K in keyof R]: R[K];
};

export function createProviderRegistry<const P extends readonly ProviderWithName<ProviderName>[]>(
  providers: P
): MergeRecord<{ [K in NameOf<P[number]>]: Extract<P[number], { readonly name: K }> }> {
  const registry: Record<string, Provider> = {};

  for (const provider of providers) {
    registry[provider.name] = provider;
  }

  return registry as unknown as MergeRecord<{ [K in NameOf<P[number]>]: Extract<P[number], { readonly name: K }> }>;
}

export function getProvider<R extends ProviderMap, N extends keyof R & ProviderName>(
  registry: R,
  name: N
): NonNullable<R[N]> {
  const provider = registry[name];
  if (!provider) {
    throw new Error(`Provider not found: ${String(name)}`);
  }

  return provider as NonNullable<R[N]>;
}
