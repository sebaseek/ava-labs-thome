import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { parseUnits } from 'viem'
import { fetchFee } from '@/api/fee'
import { fetchBalancesForVault } from '@/api/vault-balances'
import { Card, FormField } from '@/components/ui'
import { useAmountInput } from '@/hooks/useAmountInput'
import { useSelectedAsset } from '@/hooks/useSelectedAsset'
import { useSelectedVault } from '@/hooks/useSelectedVault'
import { calculateUSDValue } from '@/hooks/useUSDValue'
import { calculateTotalBalance, formatBalance } from '@/utils/balance'
import { AmountInput } from './AmountInput'
import { BalanceDisplay } from './BalanceDisplay'
import { FeeDisplay } from './FeeDisplay'
import { MaxButton } from './MaxButton'

interface AmountSelectorProps {
  onFieldClick?: () => void
}

export const AmountSelector = ({ onFieldClick }: AmountSelectorProps = {}) => {
  const { selectedAsset } = useSelectedAsset()
  const { selectedVault } = useSelectedVault()

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

  const { amount, setAmount, displayAmount, hasValue, insufficientBalance, handleAmountChange } =
    useAmountInput({
      selectedAsset,
      fee: fee ?? null,
      availableBalance: availableBalance.balance,
    })

  const formattedFee = useMemo(() => {
    if (!fee || !selectedAsset) return ''
    return formatBalance(BigInt(fee), selectedAsset.decimals)
  }, [fee, selectedAsset])

  // Calculate max amount (available balance minus fee)
  const maxAmount = useMemo(() => {
    if (!selectedAsset || !availableBalance.balance) {
      return { bigInt: BigInt(0), formatted: '0' }
    }

    const feeBigInt = fee ? BigInt(fee) : BigInt(0)
    const max =
      availableBalance.balance > feeBigInt ? availableBalance.balance - feeBigInt : BigInt(0)

    return {
      bigInt: max,
      formatted: formatBalance(max, selectedAsset.decimals),
    }
  }, [selectedAsset, availableBalance.balance, fee])

  // Check if current amount equals max amount
  const isMaxAmount = useMemo(() => {
    if (!selectedAsset || !amount || amount === '0' || amount === '0.00' || !maxAmount.formatted) {
      return false
    }

    try {
      const amountWithoutCommas = amount.replace(/,/g, '')
      const currentAmountBigInt = parseUnits(amountWithoutCommas, selectedAsset.decimals)
      return currentAmountBigInt === maxAmount.bigInt
    } catch {
      return false
    }
  }, [amount, maxAmount, selectedAsset])

  // Reset when asset changes
  useEffect(() => {
    if (selectedAsset) {
      setAmount('0.00')
    }
  }, [selectedAsset, setAmount])

  const handleMaxClick = () => {
    if (!selectedAsset || !availableBalance.balance) return
    setAmount(maxAmount.formatted)
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
    <Card>
      <div className="flex h-auto w-full flex-col">
        <FormField label="Amount">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <AmountInput
              value={displayAmount}
              onChange={handleAmountChange}
              onFocus={onFieldClick}
              placeholder="0.00"
              hasError={hasError}
              hasValue={hasValue}
              selectedAsset={selectedAsset}
            />
            <MaxButton onClick={handleMaxClick} isMaxAmount={isMaxAmount} />
          </div>
        </FormField>

        <div className="px-[25px] py-[15px]">
          <BalanceDisplay availableBalanceDisplay={availableBalanceDisplay} hasError={hasError} />

          <div className="my-2 h-[1px] w-full bg-blue-5-transparency-30" />

          <FeeDisplay
            formattedFee={formattedFee}
            selectedAsset={selectedAsset}
            feeError={feeError}
          />
        </div>
      </div>
    </Card>
  )
}
