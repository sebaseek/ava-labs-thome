import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { fetchVaults, type Vault } from '@/api/vaults'
import { EmptyState, SearchableList, SelectableField, SelectableItem } from '@/components/ui'

interface VaultSelectorProps {
  selectedVault: Vault | null
  setSelectedVault: (vault: Vault | null) => void
  onFieldClick?: () => void
  hasError?: boolean
}

const VaultSelector = ({
  selectedVault,
  setSelectedVault,
  onFieldClick,
  hasError = false,
}: VaultSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
      isLoading={isLoading}
      error={error}
      content={selectedContent}
      placeholder="Select source"
      loadingMessage="Fetching vaults..."
      errorMessage="An error occurred while loading vaults."
      showExpandedContent={!!vaults}
      hasError={hasError}
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
