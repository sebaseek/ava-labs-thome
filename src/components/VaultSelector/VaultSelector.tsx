import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchVaults, type Vault } from '@/api/vaults'
import { Input, SelectableField, SelectableItem } from '@/components/ui'

const VaultSelector = () => {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get selected vault from queryClient (reactive)
  const selectedVault = useQuery({
    queryKey: ['selectedVault'],
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  }).data as Vault | null

  const {
    data: vaults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vaults'],
    queryFn: fetchVaults,
  })

  const filteredVaults = useMemo(
    () => vaults?.filter((vault) => vault.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [vaults, searchQuery],
  )

  const handleVaultSelect = (vault: Vault) => {
    queryClient.setQueryData(['selectedVault'], vault)
    setIsOpen(false)
    setSearchQuery('')
  }

  const selectedContent = selectedVault ? (
    <div className="flex items-center gap-3">
      <span className="text-base font-medium leading-[19px] text-blue-1">{selectedVault.name}</span>
    </div>
  ) : null

  return (
    <SelectableField
      label="From"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      isLoading={isLoading}
      error={error}
      content={selectedContent}
      placeholder="Select source"
      loadingMessage="Fetching vaults..."
      errorMessage="An error occurred while loading vaults."
      showExpandedContent={!!vaults}
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-1" />
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-[48px] pl-10 pr-4"
        />
      </div>

      {/* Vault List */}
      <div className="max-h-[400px] space-y-1 overflow-y-auto">
        {filteredVaults?.map((vault) => (
          <SelectableItem
            key={vault.id}
            onClick={() => handleVaultSelect(vault)}
            selected={selectedVault?.id === vault.id}
          >
            <span className="text-base font-semibold leading-[120%] text-blue-1">{vault.name}</span>
          </SelectableItem>
        ))}

        {filteredVaults?.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-base font-medium text-blue-5">No vaults found</span>
          </div>
        )}
      </div>
    </SelectableField>
  )
}

export { VaultSelector }
