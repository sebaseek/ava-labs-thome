import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Asset } from '@/api/assets'

/**
 * Hook to get and set the selected asset
 * Uses React Query cache as state store (consider migrating to Context/Zustand for better state management)
 */
export const useSelectedAsset = () => {
  const queryClient = useQueryClient()

  const selectedAsset = useQuery<Asset | null>({
    queryKey: ['selectedAsset'],
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  }).data

  const setSelectedAsset = (asset: Asset | null) => {
    queryClient.setQueryData(['selectedAsset'], asset)
  }

  return {
    selectedAsset,
    setSelectedAsset,
  }
}
