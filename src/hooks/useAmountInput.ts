import { useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import type { Asset } from '@/api/assets'
import { formatBalance, formatNumberWithCommas } from '@/utils/balance'

interface UseAmountInputOptions {
  selectedAsset: Asset | null
  availableBalance: bigint
  fee: string | null
  isNativeToken: boolean
  amount?: string
  setAmount?: (value: string) => void
}

interface UseAmountInputReturn {
  amount: string
  setAmount: (value: string) => void
  displayAmount: string
  hasValue: boolean
  insufficientBalance: string | null
  totalNeeded: string | null
  handleAmountChange: (value: string) => void
}

/**
 * Cleans and normalizes numeric input string
 * - Removes non-numeric characters except decimal point
 * - Removes leading zeros (except for decimals like 0.5)
 * - Ensures only one decimal point
 */
const cleanAmountInput = (value: string): string => {
  let cleaned = value.replace(/[^\d.]/g, '')

  // Remove leading zeros (but preserve "0." for decimals)
  const hasLeadingZeros = cleaned.startsWith('0') && cleaned.length > 1 && !cleaned.startsWith('0.')
  if (hasLeadingZeros) {
    cleaned = cleaned.replace(/^0+/, '')
  }

  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`
  }

  return cleaned
}

/**
 * Custom hook for managing amount input with validation
 */
export const useAmountInput = ({
  selectedAsset,
  availableBalance,
  fee,
  isNativeToken,
  amount: externalAmount,
  setAmount: externalSetAmount,
}: UseAmountInputOptions): UseAmountInputReturn => {
  const [internalAmount, setInternalAmount] = useState('0.00')
  const amount = externalAmount !== undefined ? externalAmount : internalAmount
  const setAmount = externalSetAmount ?? setInternalAmount

  const handleAmountChange = (value: string) => {
    const cleaned = cleanAmountInput(value)
    setAmount(cleaned)
  }

  const hasValue = useMemo(() => amount !== '0.00' && amount !== '0' && amount !== '', [amount])

  const displayAmount = useMemo(() => {
    if (!amount || amount === '0' || amount === '0.00') {
      return ''
    }

    const endsWithDecimal = amount.endsWith('.')
    const formatted = formatNumberWithCommas(amount)

    // Preserve trailing decimal point while user is typing
    if (endsWithDecimal && !formatted.includes('.')) {
      return `${formatted}.`
    }

    return formatted
  }, [amount])

  // Check if amount exceeds balance
  // For native tokens: include fee in total needed (both come from same balance)
  // For non-native tokens: only check amount (fees paid separately in native token)
  const { insufficientBalance, totalNeeded } = useMemo(() => {
    if (!selectedAsset || !hasValue || availableBalance === BigInt(0)) {
      return { insufficientBalance: null, totalNeeded: null }
    }

    try {
      const amountWithoutCommas = amount.replace(/,/g, '')
      const amountBigInt = parseUnits(amountWithoutCommas, selectedAsset.decimals)

      // For native tokens, add fee to total needed
      const feeBigInt = isNativeToken && fee ? BigInt(fee) : BigInt(0)
      const totalNeededBigInt = amountBigInt + feeBigInt

      if (totalNeededBigInt > availableBalance) {
        const missing = totalNeededBigInt - availableBalance
        return {
          insufficientBalance: formatBalance(missing, selectedAsset.decimals),
          totalNeeded: formatBalance(totalNeededBigInt, selectedAsset.decimals),
        }
      }
    } catch {
      // Invalid input - don't show error
    }

    return { insufficientBalance: null, totalNeeded: null }
  }, [amount, hasValue, selectedAsset, availableBalance, fee, isNativeToken])

  return {
    amount,
    setAmount,
    displayAmount,
    hasValue,
    insufficientBalance,
    totalNeeded,
    handleAmountChange,
  }
}
