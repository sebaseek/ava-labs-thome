import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { parseUnits } from 'viem'
import type { Asset } from '@/api/assets'
import { fetchFee } from '@/api/fee'
import { fetchBalancesForVault } from '@/api/vault-balances'
import type { Vault } from '@/api/vaults'
import { calculateUSDValue } from '@/hooks/useUSDValue'
import { formatBalance } from '@/utils/balance'

// Native token info per network (for fee display)
const NATIVE_TOKEN_INFO: Record<string, { symbol: string; decimals: number }> = {
  'avax:Sj7NVE3jXTbJvwFAiu7OEUo_8g8ctXMG': { symbol: 'AVAX', decimals: 9 },
  'eip155:43113': { symbol: 'AVAX', decimals: 18 },
  'eip155:11155111': { symbol: 'ETH', decimals: 18 },
  'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943': {
    symbol: 'BTC',
    decimals: 8,
  },
}

interface UseAmountCalculationsOptions {
  selectedAsset: Asset | null
  selectedVault: Vault | null
  currentAmount: string
  setAmount?: (value: string) => void
  accountIndex?: number // Account index to use for balance calculation (defaults to 0)
}

interface UseAmountCalculationsReturn {
  fee: string | null
  feeError: Error | null
  feeTokenSymbol: string | null // Native token symbol for the fee (AVAX, ETH, BTC)
  isNativeToken: boolean // Whether selected asset is the native token for its network
  vaultBalances: Array<{ balance: string; accountIndex: number }> | null
  balanceError: Error | null
  availableBalance: {
    balance: bigint
    usdValue: number
    formatted: string
  }
  formattedFee: string
  maxAmount: {
    bigInt: bigint
    formatted: string
  }
  isMaxAmount: boolean
}

/**
 * Hook for managing amount-related calculations and data fetching
 * Handles fee fetching, balance fetching, and all amount calculations
 */
export const useAmountCalculations = ({
  selectedAsset,
  selectedVault,
  currentAmount,
  setAmount,
  accountIndex = 0, // Default to account 0 (matches submitTransfer default)
}: UseAmountCalculationsOptions): UseAmountCalculationsReturn => {
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

    // Use the specified account index balance (defaults to 0, same account used for transfer submission)
    // This matches the validation in submit-transfer.ts which checks the specified accountIndex
    const accountBalance = vaultBalances.find((account) => account.accountIndex === accountIndex)
    const balance = accountBalance ? BigInt(accountBalance.balance) : BigInt(0)
    const formatted = formatBalance(balance, selectedAsset.decimals)
    const usdValue = calculateUSDValue(balance, selectedAsset)

    return { balance, usdValue, formatted }
  }, [selectedAsset, selectedVault, vaultBalances, accountIndex])

  // Get native token info for the selected asset's network
  const nativeTokenInfo = useMemo(() => {
    if (!selectedAsset) return null
    return NATIVE_TOKEN_INFO[selectedAsset.networkId] || null
  }, [selectedAsset])

  // Check if the selected asset is the native token for its network
  const isNativeToken = useMemo(() => {
    if (!selectedAsset || !nativeTokenInfo) return false
    // Native tokens have "/native" in their ID
    return selectedAsset.id.includes('/native')
  }, [selectedAsset, nativeTokenInfo])

  // Format fee in native token units (AVAX, ETH, BTC)
  const formattedFee = useMemo(() => {
    if (!fee || !nativeTokenInfo) return ''
    return formatBalance(BigInt(fee), nativeTokenInfo.decimals)
  }, [fee, nativeTokenInfo])

  // Fee token symbol for display
  const feeTokenSymbol = useMemo(() => {
    return nativeTokenInfo?.symbol || null
  }, [nativeTokenInfo])

  // Calculate max amount
  // If native token: subtract fee (both transfer and fee come from same balance)
  // If non-native token: full balance (fees paid separately in native token)
  const maxAmount = useMemo(() => {
    if (!selectedAsset) {
      return { bigInt: BigInt(0), formatted: '0' }
    }

    const balance = availableBalance.balance || BigInt(0)

    // Only subtract fee if selected asset is the native token
    if (isNativeToken && fee) {
      const feeBigInt = BigInt(fee)
      const max = balance > feeBigInt ? balance - feeBigInt : balance
      return {
        bigInt: max,
        formatted: formatBalance(max, selectedAsset.decimals),
      }
    }

    // Non-native tokens: max is full balance
    return {
      bigInt: balance,
      formatted: formatBalance(balance, selectedAsset.decimals),
    }
  }, [selectedAsset, availableBalance.balance, fee, isNativeToken])

  // Check if current amount equals max amount
  const isMaxAmount = useMemo(() => {
    if (
      !selectedAsset ||
      !currentAmount ||
      currentAmount === '0' ||
      currentAmount === '0.00' ||
      !maxAmount.formatted
    ) {
      return false
    }

    try {
      const amountWithoutCommas = currentAmount.replace(/,/g, '')
      const currentAmountBigInt = parseUnits(amountWithoutCommas, selectedAsset.decimals)
      return currentAmountBigInt === maxAmount.bigInt
    } catch {
      return false
    }
  }, [currentAmount, maxAmount, selectedAsset])

  // Reset amount when asset changes
  const prevAssetIdRef = useRef<string | null>(null)
  useEffect(() => {
    const currentAssetId = selectedAsset?.id
    if (
      currentAssetId &&
      prevAssetIdRef.current !== null &&
      prevAssetIdRef.current !== currentAssetId
    ) {
      if (setAmount) {
        setAmount('0.00')
      }
    }
    prevAssetIdRef.current = currentAssetId ?? null
  }, [selectedAsset?.id, setAmount])

  return {
    fee: fee ?? null,
    feeError: feeError as Error | null,
    feeTokenSymbol,
    isNativeToken,
    vaultBalances: vaultBalances ?? null,
    balanceError: balanceError as Error | null,
    availableBalance,
    formattedFee,
    maxAmount,
    isMaxAmount,
  }
}
