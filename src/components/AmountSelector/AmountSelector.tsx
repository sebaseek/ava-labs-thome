import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import { Card, FormField } from '@/components/ui'
import { useAmountCalculations } from '@/hooks/useAmountCalculations'
import { useAmountInput } from '@/hooks/useAmountInput'
import { useBalanceDisplay } from '@/hooks/useBalanceDisplay'
import { AmountInput } from './AmountInput'
import { BalanceDisplay } from './BalanceDisplay'
import { FeeDisplay } from './FeeDisplay'
import { MaxButton } from './MaxButton'

interface AmountSelectorProps {
  selectedAsset: Asset | null
  selectedVault: Vault | null
  onFieldClick?: () => void
  amount?: string
  setAmount?: (value: string) => void
  hasError?: boolean
  validationError?: string | null
}

export const AmountSelector = ({
  selectedAsset,
  selectedVault,
  onFieldClick,
  amount,
  setAmount,
  hasError = false,
  validationError,
}: AmountSelectorProps) => {
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
  const { displayAmount, hasValue, insufficientBalance, totalNeeded, handleAmountChange } =
    useAmountInput({
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
    totalNeeded,
    availableBalance,
    selectedAsset,
  })

  const handleMaxClick = () => {
    if (!selectedAsset) return
    // Always set to max amount, even if it's 0 (when fees exceed balance)
    // This will show the insufficient balance error, which is expected
    handleAmountChange(maxAmount.formatted)
  }

  // Show validation error if present and field should show error
  const showValidationError = hasError && validationError

  return (
    <>
      <Card hasError={hasError || hasInputError}>
        <div className="flex h-auto w-full flex-col">
          <FormField label="Amount" errorMessage={showValidationError ? validationError : null}>
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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

          <div className="px-4 py-[15px] sm:px-[25px]">
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
      {/* Validation Error Message Below */}
      {showValidationError && (
        <div className="mt-2 flex items-center gap-2 px-4 sm:px-[25px]">
          <span className="text-sm font-medium leading-[120%] text-red-highlight-1">
            {validationError}
          </span>
        </div>
      )}
    </>
  )
}
