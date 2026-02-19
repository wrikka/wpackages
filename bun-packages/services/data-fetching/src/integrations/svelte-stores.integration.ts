import { writable, derived } from 'svelte/store'
import type { QueryOptions, QueryResult, MutationOptions, MutationResult } from '../types'
import type { DataFetcher } from '../services'

export function createQueryStore<TData = unknown>(
  fetcher: DataFetcher,
  options: QueryOptions<TData>
) {
  const store = writable<QueryResult<TData>>({
    data: undefined,
    error: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
    isFetching: true,
    isRefetching: false,
    refetch: () => Promise.reject(new Error('Not initialized')),
    invalidate: () => {}
  })

  const executeQuery = async () => {
    try {
      const queryResult = await fetcher.query(options)
      store.set(queryResult)
    } catch (error) {
      store.update(current => ({
        ...current,
        error: error as Error,
        isError: true,
        isLoading: false,
        isFetching: false,
        isSuccess: false
      }))
    }
  }

  if (options.enabled !== false) {
    executeQuery()
  }

  return {
    subscribe: store.subscribe,
    isLoading: derived(store, $store => $store.isLoading),
    isError: derived(store, $store => $store.isError),
    isSuccess: derived(store, $store => $store.isSuccess),
    isFetching: derived(store, $store => $store.isFetching),
    data: derived(store, $store => $store.data),
    refetch: executeQuery
  }
}

export function createMutationStore<TData = unknown, TVariables = void>(
  fetcher: DataFetcher,
  options: MutationOptions<TData, Error, TVariables>
) {
  const store = writable<MutationResult<TData, Error, TVariables>>({
    data: undefined,
    error: null,
    isPending: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    reset: () => {},
    mutate: () => Promise.reject(new Error('Not initialized')),
    mutateAsync: () => Promise.reject(new Error('Not initialized'))
  })

  const executeMutation = async (variables?: TVariables) => {
    if (!variables) return Promise.reject(new Error('Variables required'))
    
    store.update(current => ({ ...current, isPending: true, isIdle: false }))
    
    try {
      const mutationResult = await fetcher.mutate(options)
      store.set(mutationResult)
      return mutationResult.data
    } catch (error) {
      store.update(current => ({
        ...current,
        error: error as Error,
        isError: true,
        isPending: false
      }))
      throw error
    }
  }

  const reset = () => {
    store.set({
      data: undefined,
      error: null,
      isPending: false,
      isError: false,
      isSuccess: false,
      isIdle: true,
      reset: () => {},
      mutate: executeMutation,
      mutateAsync: executeMutation
    })
  }

  return {
    subscribe: store.subscribe,
    isPending: derived(store, $store => $store.isPending),
    isError: derived(store, $store => $store.isError),
    isSuccess: derived(store, $store => $store.isSuccess),
    isIdle: derived(store, $store => $store.isIdle),
    data: derived(store, $store => $store.data),
    reset,
    executeMutation
  }
}
