import { useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { formatUnits } from 'viem'
import type { Asset } from '@/api/assets'
import { fetchFee } from '@/api/fee'
import { fetchBalancesForVault } from '@/api/vault-balances'
import type { Vault } from '@/api/vaults'
import { cn } from '@/components/utils'
import { useAmountInput } from '@/hooks/useAmountInput'
import { calculateTotalBalance, formatBalance } from '@/utils/balance'
import { ASSET_PRICES } from '@/utils/prices'

export const AmountSelector = () => {
  const selectedAsset = useQuery({
    queryKey: ['selectedAsset'],
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  }).data as Asset | null

  const selectedVault = useQuery({
    queryKey: ['selectedVault'],
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  }).data as Vault | null

  const { data: fee, error: feeError } = useQuery({
    queryKey: ['fee', selectedAsset?.id],
    queryFn: () => (selectedAsset ? fetchFee(selectedAsset.id) : null),
    enabled: !!selectedAsset,
  })

  const { data: vaultBalances, error: balanceError } = useQuery({
    queryKey: ['vaultBalances', selectedAsset?.id, selectedVault?.id],
    queryFn: () => {
      if (!selectedAsset || !selectedVault) return null
      return fetchBalancesForVault(selectedAsset.id, selectedVault.id)
    },
    enabled: !!selectedAsset && !!selectedVault,
  })

  const availableBalance = useMemo(() => {
    if (!selectedAsset || !selectedVault || !vaultBalances) {
      return { balance: BigInt(0), usdValue: 0, formatted: '0' }
    }

    if (vaultBalances.length === 0) {
      return { balance: BigInt(0), usdValue: 0, formatted: '0' }
    }

    const totalBalance = calculateTotalBalance({ [selectedVault.id]: vaultBalances })
    const formatted = formatBalance(totalBalance, selectedAsset.decimals)
    const price = ASSET_PRICES[selectedAsset.coinGeckoId] || 0
    const unformattedBalance = formatUnits(totalBalance, selectedAsset.decimals)
    const usdValue = Number(unformattedBalance) * price

    return { balance: totalBalance, usdValue, formatted }
  }, [selectedAsset, selectedVault, vaultBalances])

  const { setAmount, displayAmount, hasValue, insufficientBalance, handleAmountChange } =
    useAmountInput({
      selectedAsset,
      fee: fee ?? null,
      availableBalance: availableBalance.balance,
    })

  useEffect(() => {
    if (selectedAsset) {
      setAmount('0.00')
    }
  }, [selectedAsset, setAmount])

  const formattedFee = useMemo(() => {
    if (!fee || !selectedAsset) return '0'
    return formatBalance(BigInt(fee), selectedAsset.decimals)
  }, [fee, selectedAsset])

  const handleMaxClick = () => {
    if (availableBalance.formatted) {
      setAmount(availableBalance.formatted)
    }
  }

  const hasBalanceError = !!balanceError
  const hasError = hasBalanceError || !!insufficientBalance

  const availableBalanceDisplay = useMemo(() => {
    if (hasBalanceError) {
      return 'Unable to load usable balance'
    }

    if (insufficientBalance && selectedAsset) {
      return `Insufficient balance for fee. Missing ${insufficientBalance} ${selectedAsset.symbol}`
    }

    if (!selectedAsset || !availableBalance.formatted || availableBalance.formatted === '0') {
      return '--'
    }

    const usdValue = availableBalance.usdValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const tokenAmount = `${availableBalance.formatted} ${selectedAsset.symbol}`

    return `$ ${usdValue} ≈ ${tokenAmount}`
  }, [availableBalance, selectedAsset, hasBalanceError, insufficientBalance])

  return (
    <div
      className={cn(
        'w-full rounded-[12px] border border-card-border',
        'bg-white-transparency-40 backdrop-blur-[40px]',
        'overflow-hidden transition-all duration-200',
        'hover:bg-white',
      )}
    >
      <div className="flex h-auto w-full flex-col px-[25px] py-[15px]">
        <div className="flex h-[80px] items-center">
          <div className="flex w-full items-center gap-[80px]">
            <span className="w-[120px] shrink-0 text-base font-semibold leading-[19px] text-blue-1">
              Amount
            </span>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={displayAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={cn(
                    'h-[48px] w-full rounded-[8px] border bg-white pl-4 pr-20 py-1',
                    'font-sans text-base font-medium leading-[120%]',
                    'transition-colors duration-200 outline-none',
                    hasError
                      ? 'border-red-highlight-2 focus:border-red-highlight-2 focus:ring-2 focus:ring-red-highlight-2-transparency-40'
                      : 'border-blue-5-transparency-30 focus:border-blue-5 focus:ring-2 focus:ring-blue-5/20',
                    hasValue ? 'text-blue-1' : 'text-blue-5 placeholder:text-blue-5/70',
                  )}
                />
                {selectedAsset && (
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                    <img
                      src={selectedAsset.logoUri}
                      alt={selectedAsset.symbol}
                      className="h-[18px] w-[18px]"
                    />
                    <span className="text-sm font-medium text-blue-1">{selectedAsset.symbol}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleMaxClick}
                className={cn(
                  'h-[40px] shrink-0 rounded-[8px] px-4',
                  'bg-blue-5-transparency-30 backdrop-blur-[15px]',
                  'text-sm font-medium leading-[120%] text-blue-1',
                  'transition-colors duration-200',
                  'hover:bg-blue-5/40',
                )}
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="ml-[200px] flex items-center gap-[15px]">
            {!hasError && (
              <span className="text-xs font-medium leading-[100%] text-gray-1 font-sans">
                Available
              </span>
            )}
            <span
              className={cn(
                'text-xs font-medium leading-[100%] font-sans',
                hasError ? 'text-red-highlight-2' : 'text-gray-1',
              )}
            >
              {availableBalanceDisplay}
            </span>
          </div>
        </div>

        <div className="my-2 h-[1px] w-full bg-blue-5-transparency-30" />

        <div className="flex items-center">
          <div className="flex items-center gap-[80px]">
            <div className="flex w-[120px] shrink-0 items-center gap-2">
              <span className="text-base font-semibold leading-[19px] text-blue-1">Fee</span>
              <Info className="h-2.5 w-2.5 text-blue-5" />
            </div>

            {selectedAsset &&
              (feeError ? (
                <span className="text-base font-medium leading-[120%] text-red-highlight-2">
                  Unable to load fee
                </span>
              ) : fee ? (
                <span className="text-base font-medium leading-[120%] text-blue-5">
                  {formattedFee} {selectedAsset.symbol}
                </span>
              ) : null)}
          </div>
        </div>
      </div>
    </div>
  )
}
