import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Address } from '@/api/addresses'

/**
 * Hook to get and set the selected destination address
 * Uses React Query cache as state store
 */
export const useSelectedToAddress = () => {
  const queryClient = useQueryClient()

  const selectedAddress = useQuery<Address | null>({
    queryKey: ['selectedToAddress'],
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  }).data

  const setSelectedAddress = (address: Address | null) => {
    queryClient.setQueryData(['selectedToAddress'], address)
  }

  return {
    selectedAddress,
    setSelectedAddress,
  }
}
