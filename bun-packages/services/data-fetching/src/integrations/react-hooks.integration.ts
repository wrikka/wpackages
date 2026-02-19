import { useEffect, useState, useCallback } from 'react'
import type { QueryOptions, QueryResult, MutationOptions, MutationResult } from '../types'
import type { DataFetcher } from '../services'

export function useQuery<TData = unknown>(
  fetcher: DataFetcher,
  options: QueryOptions<TData>
): QueryResult<TData> {
  const [result, setResult] = useState<QueryResult<TData>>({
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

  const executeQuery = useCallback(async () => {
    try {
      const queryResult = await fetcher.query(options)
      setResult(queryResult)
    } catch (error) {
      setResult(prev => ({
        ...prev,
        error: error as Error,
        isError: true,
        isLoading: false,
        isFetching: false,
        isSuccess: false
      }))
    }
  }, [fetcher, options])

  useEffect(() => {
    if (options.enabled !== false) {
      executeQuery()
    }
  }, [executeQuery, options.enabled])

  return result
}

export function useMutation<TData = unknown, TVariables = void>(
  fetcher: DataFetcher,
  options: MutationOptions<TData, Error, TVariables>
): MutationResult<TData, Error, TVariables> {
  const [result, setResult] = useState<MutationResult<TData, Error, TVariables>>({
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

  const executeMutation = useCallback(async (variables?: TVariables) => {
    if (!variables) return Promise.reject(new Error('Variables required'))
    
    setResult(prev => ({ ...prev, isPending: true, isIdle: false }))
    
    try {
      const mutationResult = await fetcher.mutate(options)
      setResult(mutationResult)
      return mutationResult.data
    } catch (error) {
      setResult(prev => ({
        ...prev,
        error: error as Error,
        isError: true,
        isPending: false
      }))
      throw error
    }
  }, [fetcher, options])

  const reset = useCallback(() => {
    setResult({
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
  }, [executeMutation])

  return {
    ...result,
    reset,
    mutate: executeMutation,
    mutateAsync: executeMutation
  }
}
