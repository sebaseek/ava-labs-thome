import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { Asset } from '@/api/assets'
import { fetchVaults, type Vault } from '@/api/vaults'
import { EmptyState, SearchableList, SelectableField, SelectableItem } from '@/components/ui'

interface VaultSelectorProps {
  selectedVault: Vault | null
  setSelectedVault: (vault: Vault | null) => void
  selectedAsset: Asset | null
  onFieldClick?: () => void
  hasError?: boolean
  validationError?: string | null
}

const VaultSelector = ({
  selectedVault,
  setSelectedVault,
  selectedAsset,
  onFieldClick,
  hasError = false,
  validationError,
}: VaultSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  // Check if assets are loaded (not loading) first
  const assetsQueryState = queryClient.getQueryState(['assets'])
  const assetsLoaded = assetsQueryState?.status === 'success'
  const assetsLoading = assetsQueryState?.status === 'loading'

  // Only fetch vaults after assets are loaded (not while assets are loading)
  const {
    data: vaults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vaults'],
    queryFn: fetchVaults,
    enabled: assetsLoaded, // Only enable after assets are successfully loaded
  })

  // Only show loading if assets are done loading AND vaults are loading
  const showLoading = assetsLoaded && isLoading && !assetsLoading

  // Disabled when: No asset selected OR loading OR error
  // Note: Loading/error states are handled by SelectableField's canInteract logic
  const isDisabled = !selectedAsset

  const filteredVaults = useMemo(
    () => vaults?.filter((vault) => vault.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [vaults, searchQuery],
  )

  const handleVaultSelect = (vault: Vault) => {
    setSelectedVault(vault)
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
      onToggle={() => {
        setIsOpen(!isOpen)
        onFieldClick?.()
      }}
      isLoading={showLoading}
      error={error}
      content={selectedContent}
      placeholder="Select source"
      loadingMessage="Fetching vaults..."
      errorMessage="An error occurred while loading vaults."
      showExpandedContent={!!vaults}
      hasError={hasError}
      validationError={validationError}
      disabled={isDisabled}
    >
      <SearchableList
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search"
      >
        <div className="max-h-[400px] space-y-1 overflow-y-auto">
          {filteredVaults?.map((vault) => (
            <SelectableItem
              key={vault.id}
              onClick={() => handleVaultSelect(vault)}
              selected={selectedVault?.id === vault.id}
            >
              <span className="text-base font-semibold leading-[120%] text-blue-1">
                {vault.name}
              </span>
            </SelectableItem>
          ))}

          {filteredVaults?.length === 0 && <EmptyState message="No vaults found" />}
        </div>
      </SearchableList>
    </SelectableField>
  )
}

export { VaultSelector }
