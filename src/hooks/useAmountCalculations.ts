import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { parseUnits } from 'viem'
import type { Asset } from '@/api/assets'
import { fetchFee } from '@/api/fee'
import { fetchBalancesForVault } from '@/api/vault-balances'
import type { Vault } from '@/api/vaults'
import { calculateUSDValue } from '@/hooks/useUSDValue'
import { calculateTotalBalance, formatBalance } from '@/utils/balance'

interface UseAmountCalculationsOptions {
  selectedAsset: Asset | null
  selectedVault: Vault | null
  currentAmount: string
  setAmount?: (value: string) => void
}

interface UseAmountCalculationsReturn {
  fee: string | null
  feeError: Error | null
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

    const totalBalance = calculateTotalBalance({ [selectedVault.id]: vaultBalances })
    const formatted = formatBalance(totalBalance, selectedAsset.decimals)
    const usdValue = calculateUSDValue(totalBalance, selectedAsset)

    return { balance: totalBalance, usdValue, formatted }
  }, [selectedAsset, selectedVault, vaultBalances])

  const formattedFee = useMemo(() => {
    if (!fee || !selectedAsset) return ''
    return formatBalance(BigInt(fee), selectedAsset.decimals)
  }, [fee, selectedAsset])

  // Calculate max amount
  // If balance > fee: max = balance - fee (normal case, can send without error)
  // If balance <= fee: max = balance (full balance, will show insufficient balance error for fees, which is expected)
  const maxAmount = useMemo(() => {
    if (!selectedAsset) {
      return { bigInt: BigInt(0), formatted: '0' }
    }

    const feeBigInt = fee ? BigInt(fee) : BigInt(0)
    const balance = availableBalance.balance || BigInt(0)

    // If fees exceed or equal balance, set max to full balance (user will see error, which is expected)
    // Otherwise, set max to balance - fee (normal case)
    const max = balance > feeBigInt ? balance - feeBigInt : balance

    return {
      bigInt: max,
      formatted: formatBalance(max, selectedAsset.decimals),
    }
  }, [selectedAsset, availableBalance.balance, fee])

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
    vaultBalances: vaultBalances ?? null,
    balanceError: balanceError as Error | null,
    availableBalance,
    formattedFee,
    maxAmount,
    isMaxAmount,
  }
}
