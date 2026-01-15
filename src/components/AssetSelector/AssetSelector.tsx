import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { type Asset, fetchAssets } from '@/api/assets'
import { fetchNetworks } from '@/api/networks'
import { assetToVaultBalances } from '@/api/vault-balances'
import { EmptyState, SearchableList, SelectableField, SelectableItem } from '@/components/ui'
import { useSelectedAsset } from '@/hooks/useSelectedAsset'
import { calculateUSDValue } from '@/hooks/useUSDValue'
import { calculateTotalBalance, formatBalance } from '@/utils/balance'

interface AssetSelectorProps {
  onFieldClick?: () => void
  hasError?: boolean
}

const AssetSelector = ({ onFieldClick, hasError = false }: AssetSelectorProps = {}) => {
  const { selectedAsset, setSelectedAsset } = useSelectedAsset()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: assets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
  })

  const { data: networks } = useQuery({
    queryKey: ['networks'],
    queryFn: fetchNetworks,
  })

  const networkMap = useMemo(
    () =>
      networks?.reduce(
        (acc, network) => {
          acc[network.id] = network.name
          return acc
        },
        {} as Record<string, string>,
      ),
    [networks],
  )

  const filteredAssets = useMemo(
    () =>
      assets?.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          networkMap?.[asset.networkId]?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [assets, searchQuery, networkMap],
  )

  const assetsWithBalances = useMemo(
    () =>
      filteredAssets?.map((asset) => {
        const vaultData = assetToVaultBalances[asset.id]
        if (!vaultData) {
          return { asset, balance: '0', usdValue: 0 }
        }

        const totalBalance = calculateTotalBalance(vaultData)
        const balance = formatBalance(totalBalance, asset.decimals)
        const usdValue = calculateUSDValue(totalBalance, asset)

        return { asset, balance, usdValue }
      }),
    [filteredAssets],
  )

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsOpen(false)
    setSearchQuery('')
  }

  const selectedContent = selectedAsset ? (
    <div className="flex items-center gap-3">
      <img src={selectedAsset.logoUri} alt={selectedAsset.symbol} className="h-6 w-6" />
      <div className="flex flex-col items-start">
        <span className="text-base font-medium leading-[19px] text-blue-1">
          {selectedAsset.symbol}
        </span>
        <span className="text-sm font-medium leading-[17px] text-blue-5">
          {networkMap?.[selectedAsset.networkId]}
        </span>
      </div>
    </div>
  ) : null

  return (
    <SelectableField
      label="Asset"
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen(!isOpen)
        onFieldClick?.()
      }}
      isLoading={isLoading}
      error={error}
      content={selectedContent}
      placeholder="Select Asset"
      loadingMessage="Fetching assets..."
      errorMessage="An error occurred while loading assets."
      showExpandedContent={!!assets}
      hasError={hasError}
    >
      <SearchableList
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search"
      >
        <div className="max-h-[400px] space-y-1 overflow-y-auto">
          {assetsWithBalances?.map(({ asset, balance, usdValue }) => (
            <SelectableItem
              key={asset.id}
              onClick={() => handleAssetSelect(asset)}
              selected={selectedAsset?.id === asset.id}
            >
              {/* Left side: Logo, Symbol, Name */}
              <div className="flex items-center gap-3">
                <img src={asset.logoUri} alt={asset.symbol} className="h-8 w-8" />
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold leading-[120%] text-blue-1">
                    {asset.symbol}
                  </span>
                  <span className="text-sm font-medium leading-[120%] text-blue-5">
                    {networkMap?.[asset.networkId]}
                  </span>
                </div>
              </div>

              {/* Right side: Balance and USD value */}
              <div className="flex flex-col items-end">
                <span className="text-base font-medium leading-[120%] text-blue-1">
                  {balance} {asset.symbol}
                </span>
                <span className="text-sm font-medium leading-[120%] text-blue-5">
                  $
                  {usdValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </SelectableItem>
          ))}

          {assetsWithBalances?.length === 0 && <EmptyState message="No assets found" />}
        </div>
      </SearchableList>
    </SelectableField>
  )
}

export { AssetSelector }
