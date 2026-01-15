import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Vault } from '@/api/vaults'

/**
 * Hook to get and set the selected vault
 * Uses React Query cache as state store
 */
export const useSelectedVault = () => {
  const queryClient = useQueryClient()

  const selectedVault = useQuery<Vault | null>({
    queryKey: ['selectedVault'],
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  }).data

  const setSelectedVault = (vault: Vault | null) => {
    queryClient.setQueryData(['selectedVault'], vault)
  }

  return {
    selectedVault,
    setSelectedVault,
  }
}
