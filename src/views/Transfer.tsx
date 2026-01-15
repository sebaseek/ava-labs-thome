import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import {
  AmountSelector,
  AssetSelector,
  Memo,
  NavigationControl,
  Stepper,
  ToVaultSelector,
  TransferSuccess,
  Typography,
  VaultSelector,
} from '@/components'
import type { FormType } from '@/hooks/form-types'
import { useFormReset } from '@/hooks/useFormReset'
import { useFormStateSync } from '@/hooks/useFormStateSync'
import { useSelectedAsset } from '@/hooks/useSelectedAsset'
import { useSelectedToAddress } from '@/hooks/useSelectedToAddress'
import { useSelectedVault } from '@/hooks/useSelectedVault'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { useTransferFormValidation } from '@/hooks/useTransferFormValidation'
import type { TransferFormInputValues } from '@/schemas/transfer'
import { transferFormSchema } from '@/schemas/transfer'

export const Transfer = () => {
  const { selectedAsset, setSelectedAsset } = useSelectedAsset()
  const { selectedVault, setSelectedVault } = useSelectedVault()
  const { selectedAddress, setSelectedAddress } = useSelectedToAddress()
  const [transferCompleted, setTransferCompleted] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const form = useForm({
    defaultValues: {
      asset: null,
      vault: null,
      toAddress: null,
      amount: '0.00',
      memo: '',
    } as TransferFormInputValues,
    onSubmit: async ({ value }) => {
      // Validate using Zod schema
      const result = transferFormSchema.safeParse(value)
      if (result.success) {
        setTransferCompleted(true)
      }
    },
  })

  // Sync hook-based state with form state
  useFormStateSync({
    form: form as FormType,
    selectedAsset,
    selectedVault,
    selectedAddress,
  })

  // Step navigation logic
  const { activeStep, handleStepClick } = useStepNavigation({
    selectedAsset,
    selectedVault,
  })

  // Form reset logic
  const { resetForm } = useFormReset({
    form: form as FormType,
    setters: {
      setSelectedAsset,
      setSelectedVault,
      setSelectedAddress,
      setTransferCompleted,
      setHasAttemptedSubmit,
    },
  })

  // Form validation logic
  const { assetError, vaultError, toAddressError, amountError, validateForm } =
    useTransferFormValidation({
      form: form as FormType,
      selectedAsset,
      selectedVault,
      selectedAddress,
      hasAttemptedSubmit,
    })

  const handleStartOver = () => {
    resetForm()
  }

  const handleSubmitTransfer = async () => {
    setHasAttemptedSubmit(true)

    // Update form values from hook state before validation
    form.setFieldValue('asset', selectedAsset as any)
    form.setFieldValue('vault', selectedVault as any)
    form.setFieldValue('toAddress', selectedAddress as any)

    // Validate form using Zod schema
    const result = validateForm()

    if (result.success) {
      setTransferCompleted(true)
    } else {
      // Validation failed - errors will be shown via hasError props
      // The form state will be updated but we don't proceed
    }
  }

  const handleNewRequest = () => {
    handleStartOver()
  }

  const handleViewTransaction = () => {
    window.open(
      'https://subnets.avax.network/p-chain/block/24209543',
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'var(--color-gradient-background)',
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        {transferCompleted ? (
          /* Success Screen */
          <div className="flex items-center justify-center py-12">
            <TransferSuccess
              onViewTransaction={handleViewTransaction}
              onNewRequest={handleNewRequest}
            />
          </div>
        ) : (
          /* Form Screen */
          <>
            {/* Title - Full Width Row */}
            <Typography variant="h3" className="mb-6 text-blue-1 md:mb-8">
              Transfer
            </Typography>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr] md:gap-12">
              {/* Left Column - Stepper (hidden on mobile) */}
              <div className="hidden md:block">
                <Stepper activeStep={activeStep} />
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                {/* Asset Selector */}
                <AssetSelector onFieldClick={() => handleStepClick(0)} hasError={assetError} />
                {/* Vault Selector */}
                <VaultSelector onFieldClick={() => handleStepClick(1)} hasError={vaultError} />
                {/* To Vault Selector */}
                <ToVaultSelector
                  onFieldClick={() => handleStepClick(2)}
                  hasError={toAddressError}
                />
                {/* Amount Selector */}
                <form.Field name="amount">
                  {(field) => (
                    <AmountSelector
                      amount={field.state.value}
                      setAmount={(value) => {
                        field.handleChange(value)
                      }}
                      onFieldClick={() => handleStepClick(3)}
                      hasError={amountError}
                    />
                  )}
                </form.Field>
                {/* Memo */}
                <form.Field name="memo">
                  {(field) => (
                    <Memo
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value)
                      }}
                      onFieldClick={() => handleStepClick(4)}
                    />
                  )}
                </form.Field>
                {/* Navigation Control */}
                <NavigationControl
                  onStartOver={handleStartOver}
                  onSubmitTransfer={handleSubmitTransfer}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
