import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import {
  AmountSelector,
  AssetSelector,
  Memo,
  NavigationControl,
  type StepIndex,
  Stepper,
  ToVaultSelector,
  TransferSuccess,
  Typography,
  VaultSelector,
} from '@/components'
import { useSelectedAsset } from '@/hooks/useSelectedAsset'
import { useSelectedToAddress } from '@/hooks/useSelectedToAddress'
import { useSelectedVault } from '@/hooks/useSelectedVault'
import { type TransferFormValues, transferFormSchema } from '@/schemas/transfer'

export const Transfer = () => {
  const { selectedAsset, setSelectedAsset } = useSelectedAsset()
  const { selectedVault, setSelectedVault } = useSelectedVault()
  const { selectedAddress, setSelectedAddress } = useSelectedToAddress()
  const [activeStep, setActiveStep] = useState<StepIndex | null>(null)
  const [transferCompleted, setTransferCompleted] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const form = useForm({
    defaultValues: {
      asset: null as Asset | null,
      vault: null as Vault | null,
      toAddress: null as Address | null,
      amount: '0.00',
      memo: '',
    } as TransferFormValues,
    onSubmit: async ({ value }) => {
      // Validate using Zod schema
      const result = transferFormSchema.safeParse(value)
      if (result.success) {
        setTransferCompleted(true)
      }
    },
  })

  // Sync hook-based state to form (components update hooks, form needs to stay in sync)
  useEffect(() => {
    if (selectedAsset !== form.state.values.asset) {
      form.setFieldValue('asset', selectedAsset as any)
    }
  }, [selectedAsset, form.state.values.asset, form.setFieldValue])

  useEffect(() => {
    if (selectedVault !== form.state.values.vault) {
      form.setFieldValue('vault', selectedVault as any)
    }
  }, [selectedVault, form.state.values.vault, form.setFieldValue])

  useEffect(() => {
    if (selectedAddress !== form.state.values.toAddress) {
      form.setFieldValue('toAddress', selectedAddress as any)
    }
  }, [selectedAddress, form.state.values.toAddress, form.setFieldValue])

  // Check if a step is disabled
  const isStepDisabled = (step: StepIndex): boolean => {
    // Use hook state for asset/vault since components update hooks directly
    if (step === 0 || step === 4) return false // Asset and Memo are never disabled
    if (step === 1 || step === 2) return !selectedAsset // Vault and To require asset
    if (step === 3) return !selectedAsset || !selectedVault // Amount requires asset and vault
    return false
  }

  // Handle step click/focus - only set if not disabled
  const handleStepClick = (step: StepIndex) => {
    if (!isStepDisabled(step)) {
      setActiveStep(step)
    }
  }

  const handleStartOver = () => {
    form.reset()
    form.setFieldValue('asset', null as any)
    form.setFieldValue('vault', null as any)
    form.setFieldValue('toAddress', null as any)
    form.setFieldValue('amount', '0.00')
    form.setFieldValue('memo', '')
    setSelectedAsset(null)
    setSelectedVault(null)
    setSelectedAddress(null)
    setActiveStep(null)
    setTransferCompleted(false)
    setHasAttemptedSubmit(false)
  }

  const handleSubmitTransfer = async () => {
    setHasAttemptedSubmit(true)

    // Update form values from hook state before validation
    form.setFieldValue('asset', selectedAsset as any)
    form.setFieldValue('vault', selectedVault as any)
    form.setFieldValue('toAddress', selectedAddress as any)

    // Validate form using Zod schema
    const currentValues = {
      ...form.state.values,
      asset: selectedAsset,
      vault: selectedVault,
      toAddress: selectedAddress,
    }
    const result = transferFormSchema.safeParse(currentValues)

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
    // TODO: Implement view transaction functionality
    console.log('View Transaction clicked')
  }

  // Validate form values using Zod schema (only if submit was attempted)
  const validateForm = () => {
    const currentValues = {
      ...form.state.values,
      asset: selectedAsset,
      vault: selectedVault,
      toAddress: selectedAddress,
    }
    return transferFormSchema.safeParse(currentValues)
  }

  // Only validate and show errors if user has attempted to submit
  const fieldErrors: Partial<Record<keyof TransferFormValues, string>> = (() => {
    if (!hasAttemptedSubmit) {
      return {}
    }
    const validationResult = validateForm()
    if (validationResult.success) {
      return {}
    }
    const errors: Partial<Record<keyof TransferFormValues, string>> = {}
    for (const error of validationResult.error.issues) {
      const fieldName = error.path[0] as keyof TransferFormValues | undefined
      if (fieldName) {
        errors[fieldName] = error.message
      }
    }
    return errors
  })()

  const assetError = hasAttemptedSubmit && !!fieldErrors.asset
  const vaultError = hasAttemptedSubmit && !!fieldErrors.vault
  const toAddressError = hasAttemptedSubmit && !!fieldErrors.toAddress
  const amountError = hasAttemptedSubmit && !!fieldErrors.amount

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
