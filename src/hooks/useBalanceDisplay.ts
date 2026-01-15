import { useMemo } from 'react'
import type { Asset } from '@/api/assets'

interface UseBalanceDisplayOptions {
  balanceError: Error | null
  insufficientBalance: string | null
  availableBalance: {
    balance: bigint
    usdValue: number
    formatted: string
  }
  selectedAsset: Asset | null
}

interface UseBalanceDisplayReturn {
  hasBalanceError: boolean
  hasInputError: boolean
  displayText: string
}

/**
 * Hook for managing balance display logic and error states
 * Handles formatting and error message generation for balance display
 */
export const useBalanceDisplay = ({
  balanceError,
  insufficientBalance,
  availableBalance,
  selectedAsset,
}: UseBalanceDisplayOptions): UseBalanceDisplayReturn => {
  const hasBalanceError = !!balanceError
  const hasInputError = hasBalanceError || !!insufficientBalance

  const displayText = useMemo(() => {
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

  return {
    hasBalanceError,
    hasInputError,
    displayText,
  }
}
