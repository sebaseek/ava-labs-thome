import { useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import type { Asset } from '@/api/assets'
import { formatBalance, formatNumberWithCommas } from '@/utils/balance'

interface UseAmountInputOptions {
  selectedAsset: Asset | null
  fee: string | null
  availableBalance: bigint
  amount?: string
  setAmount?: (value: string) => void
}

interface UseAmountInputReturn {
  amount: string
  setAmount: (value: string) => void
  displayAmount: string
  hasValue: boolean
  insufficientBalance: string | null
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
  fee,
  availableBalance,
  amount: externalAmount,
  setAmount: externalSetAmount,
}: UseAmountInputOptions): UseAmountInputReturn => {
  const [internalAmount, setInternalAmount] = useState('0.00')
  const amount = externalAmount ?? internalAmount
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

  const insufficientBalance = useMemo(() => {
    if (!selectedAsset || !fee || !hasValue || availableBalance === BigInt(0)) {
      return null
    }

    try {
      const amountWithoutCommas = amount.replace(/,/g, '')
      const amountBigInt = parseUnits(amountWithoutCommas, selectedAsset.decimals)
      const feeBigInt = BigInt(fee)
      const totalNeeded = amountBigInt + feeBigInt

      if (totalNeeded > availableBalance) {
        const missing = totalNeeded - availableBalance
        return formatBalance(missing, selectedAsset.decimals)
      }
    } catch {
      // Invalid input - don't show error
    }

    return null
  }, [amount, hasValue, selectedAsset, fee, availableBalance])

  return {
    amount,
    setAmount,
    displayAmount,
    hasValue,
    insufficientBalance,
    handleAmountChange,
  }
}
