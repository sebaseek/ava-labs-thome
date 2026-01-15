import { Card, FormField } from '@/components/ui'
import { useAmountCalculations } from '@/hooks/useAmountCalculations'
import { useAmountInput } from '@/hooks/useAmountInput'
import { useBalanceDisplay } from '@/hooks/useBalanceDisplay'
import { useSelectedAsset } from '@/hooks/useSelectedAsset'
import { useSelectedVault } from '@/hooks/useSelectedVault'
import { AmountInput } from './AmountInput'
import { BalanceDisplay } from './BalanceDisplay'
import { FeeDisplay } from './FeeDisplay'
import { MaxButton } from './MaxButton'

interface AmountSelectorProps {
  onFieldClick?: () => void
  amount?: string
  setAmount?: (value: string) => void
  hasError?: boolean
}

export const AmountSelector = ({
  onFieldClick,
  amount,
  setAmount,
  hasError = false,
}: AmountSelectorProps = {}) => {
  const { selectedAsset } = useSelectedAsset()
  const { selectedVault } = useSelectedVault()

  // Get all calculations (fee, balances, max amount, etc.)
  // Note: currentAmount is calculated internally, we pass the external amount
  const { fee, feeError, balanceError, availableBalance, formattedFee, maxAmount, isMaxAmount } =
    useAmountCalculations({
      selectedAsset,
      selectedVault,
      currentAmount: amount || '0.00',
      setAmount,
    })

  // Get amount input state and handlers with actual fee and balance
  const { displayAmount, hasValue, insufficientBalance, handleAmountChange } = useAmountInput({
    selectedAsset,
    fee: fee,
    availableBalance: availableBalance.balance,
    amount,
    setAmount,
  })

  // Get balance display logic
  const { hasInputError, displayText } = useBalanceDisplay({
    balanceError,
    insufficientBalance,
    availableBalance,
    selectedAsset,
  })

  const handleMaxClick = () => {
    if (!selectedAsset || !availableBalance.balance) return
    // handleAmountChange will clean the formatted value (remove commas) before setting
    handleAmountChange(maxAmount.formatted)
  }

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
              hasError={hasError || hasInputError}
              hasValue={hasValue}
              selectedAsset={selectedAsset}
            />
            <MaxButton onClick={handleMaxClick} isMaxAmount={isMaxAmount} />
          </div>
        </FormField>

        <div className="px-[25px] py-[15px]">
          <BalanceDisplay availableBalanceDisplay={displayText} hasError={hasInputError} />

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
