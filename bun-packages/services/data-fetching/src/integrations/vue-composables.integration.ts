import { ref, computed } from 'vue'
import type { QueryOptions, QueryResult, MutationOptions, MutationResult } from '../types'
import type { DataFetcher } from '../services'

export function useQuery<TData = unknown>(
  fetcher: DataFetcher,
  options: QueryOptions<TData>
) {
  const result = ref<QueryResult<TData>>({
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

  const isLoading = computed(() => result.value.isLoading)
  const isError = computed(() => result.value.isError)
  const isSuccess = computed(() => result.value.isSuccess)
  const isFetching = computed(() => result.value.isFetching)
  const data = computed(() => result.value.data)

  const executeQuery = async () => {
    try {
      const queryResult = await fetcher.query(options)
      result.value = queryResult
    } catch (error) {
      result.value = {
        ...result.value,
        error: error as Error,
        isError: true,
        isLoading: false,
        isFetching: false,
        isSuccess: false
      }
    }
  }

  if (options.enabled !== false) {
    executeQuery()
  }

  return {
    result,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    data
  }
}

export function useMutation<TData = unknown, TVariables = void>(
  fetcher: DataFetcher,
  options: MutationOptions<TData, Error, TVariables>
) {
  const result = ref<MutationResult<TData, Error, TVariables>>({
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

  const isPending = computed(() => result.value.isPending)
  const isError = computed(() => result.value.isError)
  const isSuccess = computed(() => result.value.isSuccess)
  const isIdle = computed(() => result.value.isIdle)
  const data = computed(() => result.value.data)

  const executeMutation = async (variables?: TVariables) => {
    if (!variables) return Promise.reject(new Error('Variables required'))
    
    result.value = { ...result.value, isPending: true, isIdle: false }
    
    try {
      const mutationResult = await fetcher.mutate(options)
      result.value = mutationResult
      return mutationResult.data
    } catch (error) {
      result.value = {
        ...result.value,
        error: error as Error,
        isError: true,
        isPending: false
      }
      throw error
    }
  }

  const reset = () => {
    result.value = {
      data: undefined,
      error: null,
      isPending: false,
      isError: false,
      isSuccess: false,
      isIdle: true,
      reset: () => {},
      mutate: executeMutation,
      mutateAsync: executeMutation
    }
  }

  return {
    result,
    isPending,
    isError,
    isSuccess,
    isIdle,
    data,
    reset,
    executeMutation
  }
}
