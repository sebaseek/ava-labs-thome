import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import type { Address } from '@/api/addresses'
import { networkToVaultToAddresses } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import { assetToVaultBalances } from '@/api/vault-balances'
import { fetchVaults } from '@/api/vaults'
import { EmptyState, SelectableField, SelectableItem } from '@/components/ui'
import { cn } from '@/components/utils'
import { calculateUSDValue } from '@/hooks/useUSDValue'
import { formatBalance } from '@/utils/balance'

interface AccountWithBalance {
  address: Address
  accountName: string
  vaultId: string
  vaultName: string
  balance: string
  balanceFormatted: string
  usdValue: number
}

interface ToVaultSelectorProps {
  selectedAsset: Asset | null
  selectedAddress: Address | null
  setSelectedAddress: (address: Address | null) => void
  onFieldClick?: () => void
  hasError?: boolean
}

const ToVaultSelector = ({
  selectedAsset,
  selectedAddress,
  setSelectedAddress,
  onFieldClick,
  hasError = false,
}: ToVaultSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string | null>(null) // null = "All"

  // Fetch vaults for filter tabs
  const { data: vaults } = useQuery({
    queryKey: ['vaults'],
    queryFn: fetchVaults,
  })

  // Get all addresses for the selected network, grouped by vault
  const accountsWithBalances = useMemo(() => {
    if (!selectedAsset) {
      return []
    }

    const network = networkToVaultToAddresses[selectedAsset.networkId]
    if (!network) {
      return []
    }

    const assetBalances = assetToVaultBalances[selectedAsset.id]
    if (!assetBalances) {
      return []
    }

    const accounts: AccountWithBalance[] = []

    // Iterate through all vaults in the network
    for (const [vaultId, addresses] of Object.entries(network)) {
      const vaultBalances = assetBalances[vaultId] || []

      // Match addresses with balances by array index (assuming address[0] = accountIndex 0, etc.)
      addresses.forEach((address, addressIndex) => {
        // Create account name like "Account 0", "Account 1", etc.
        const accountName = `Account ${addressIndex}`
        // Try to find balance for this account index
        // First try exact match, then try to find any unused balance
        let accountBalance = vaultBalances.find((bal) => bal.accountIndex === addressIndex)

        // If no exact match and we have balances, use the first available one
        // This handles cases where addresses and balances don't align perfectly
        if (!accountBalance && vaultBalances.length > 0) {
          // For now, only show balance if we have an exact index match
          // External addresses might not have balances
          accountBalance = undefined
        }

        const balance = accountBalance?.balance || '0'
        const balanceBigInt = BigInt(balance)
        const balanceFormatted = formatBalance(balanceBigInt, selectedAsset.decimals)
        const usdValue = calculateUSDValue(balanceBigInt, selectedAsset)

        // Get vault name
        const vault = vaults?.find((v) => v.id === vaultId)
        const vaultName = vault?.name || `Vault ${vaultId}`

        accounts.push({
          address,
          accountName,
          vaultId,
          vaultName,
          balance,
          balanceFormatted,
          usdValue,
        })
      })
    }

    return accounts
  }, [selectedAsset, vaults])

  // Filter accounts by selected vault
  const filteredAccounts = useMemo(() => {
    if (!selectedVaultFilter) {
      return accountsWithBalances
    }
    return accountsWithBalances.filter((account) => account.vaultId === selectedVaultFilter)
  }, [accountsWithBalances, selectedVaultFilter])

  // Get vault counts for filter tabs
  const vaultCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    accountsWithBalances.forEach((account) => {
      counts[account.vaultId] = (counts[account.vaultId] || 0) + 1
    })
    return counts
  }, [accountsWithBalances])

  const handleAddressSelect = (account: AccountWithBalance) => {
    setSelectedAddress(account.address)
    setIsOpen(false)
  }

  // Clear selected address if it's no longer valid for the current asset
  useEffect(() => {
    if (selectedAddress && selectedAsset) {
      const isValid = accountsWithBalances.some(
        (acc) => acc.address.address === selectedAddress.address,
      )
      if (!isValid) {
        setSelectedAddress(null)
      }
    }
  }, [selectedAsset, accountsWithBalances, selectedAddress, setSelectedAddress])

  // Find the selected account to show account name
  const selectedAccount = useMemo(() => {
    if (!selectedAddress) return null
    return accountsWithBalances.find((acc) => acc.address.address === selectedAddress.address)
  }, [selectedAddress, accountsWithBalances])

  const selectedContent = selectedAccount ? (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-start">
        <span className="text-base font-medium leading-[19px] text-blue-1">
          {selectedAccount.accountName}
        </span>
        <span className="text-sm font-medium leading-[17px] text-blue-5">
          {selectedAccount.vaultName}
        </span>
      </div>
    </div>
  ) : null

  const isLoading = false
  const error = null
  const showExpandedContent = !!selectedAsset

  return (
    <SelectableField
      label="To"
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen(!isOpen)
        onFieldClick?.()
      }}
      isLoading={isLoading}
      error={error}
      content={selectedContent}
      placeholder="Select destination"
      loadingMessage="Fetching addresses..."
      errorMessage="An error occurred while loading addresses."
      showExpandedContent={showExpandedContent}
      hasError={hasError}
    >
      {/* Vault Filter Tabs */}
      {selectedAsset && accountsWithBalances.length > 0 && (
        <div
          className={cn(
            'mb-4 rounded-[8px] border border-blue-5-transparency-15 bg-white-transparency-40 p-2 backdrop-blur-[40px]',
          )}
        >
          <div className="flex gap-[5px] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setSelectedVaultFilter(null)}
              className={cn(
                'shrink-0 rounded-[8px] px-4 py-2 text-base font-semibold transition-colors whitespace-nowrap',
                selectedVaultFilter === null
                  ? 'bg-blue-highlight-4 text-blue-2'
                  : 'text-blue-5 hover:bg-white-transparency-40',
              )}
            >
              All
              {accountsWithBalances.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-1 px-2 py-0.5 text-xs font-medium text-white">
                  {accountsWithBalances.length}
                </span>
              )}
            </button>
            {vaults?.map((vault) => {
              const count = vaultCounts[vault.id] || 0
              if (count === 0) return null
              return (
                <button
                  key={vault.id}
                  type="button"
                  onClick={() => setSelectedVaultFilter(vault.id)}
                  className={cn(
                    'shrink-0 rounded-[8px] px-4 py-2 text-base font-semibold transition-colors whitespace-nowrap',
                    selectedVaultFilter === vault.id
                      ? 'bg-blue-highlight-4 text-blue-2'
                      : 'text-blue-5 hover:bg-white-transparency-40',
                  )}
                >
                  {vault.name}
                  {count > 0 && (
                    <span className="ml-2 rounded-full bg-gray-1 px-2 py-0.5 text-xs font-medium text-white">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="max-h-[400px] space-y-1 overflow-y-auto">
        {filteredAccounts.map((account) => (
          <SelectableItem
            key={`${account.vaultId}-${account.address.address}`}
            onClick={() => handleAddressSelect(account)}
            selected={selectedAddress?.address === account.address.address}
          >
            {/* Left: Account name and vault name */}
            <div className="flex flex-col items-start">
              <span className="text-base font-semibold leading-[120%] text-blue-1">
                {account.accountName}
              </span>
              <span className="text-sm font-medium leading-[120%] text-blue-5">
                {account.vaultName}
              </span>
            </div>

            {/* Right: Token balance and USD value */}
            <div className="flex flex-col items-end">
              <span className="text-base font-medium leading-[120%] text-blue-1">
                {account.balanceFormatted} {selectedAsset?.symbol}
              </span>
              <span className="text-sm font-medium leading-[120%] text-blue-5">
                $
                {account.usdValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </SelectableItem>
        ))}

        {filteredAccounts.length === 0 && (
          <EmptyState
            message={
              !selectedAsset
                ? 'Please select an asset first'
                : accountsWithBalances.length === 0
                  ? 'No accounts found for this asset'
                  : 'No accounts found for selected vault'
            }
          />
        )}
      </div>
    </SelectableField>
  )
}

export { ToVaultSelector }
