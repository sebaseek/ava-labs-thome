import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { type Asset, fetchAssets } from '@/api/assets'
import { fetchNetworks } from '@/api/networks'
import { assetToVaultBalances } from '@/api/vault-balances'
import { SelectableItem, SelectableField, Input } from '@/components/ui'
import { calculateTotalBalance, formatBalance } from '@/utils/balance'

// Asset prices in USD (mocked data from vault-balances comments)
const ASSET_PRICES: Record<string, number> = {
  'avalanche-2': 25.46,
  'usd-coin': 1.0,
  ethereum: 4311.56,
  bitcoin: 112213.21,
}

const AssetSelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
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
        const price = ASSET_PRICES[asset.coinGeckoId] || 0
        const usdValue = parseFloat(balance) * price

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
      onToggle={() => setIsOpen(!isOpen)}
      isLoading={isLoading}
      error={error}
      content={selectedContent}
      placeholder="Select Asset"
      loadingMessage="Fetching assets..."
      errorMessage="An error occurred while loading assets."
      showExpandedContent={!!assets}
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

      {/* Asset List */}
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

        {assetsWithBalances?.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-base font-medium text-blue-5">No assets found</span>
          </div>
        )}
      </div>
    </SelectableField>
  )
}

export { AssetSelector }
