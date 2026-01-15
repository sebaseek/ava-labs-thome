import { useForm } from '@tanstack/react-form'
import { useEffect, useRef, useState } from 'react'
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
import { useFormReset } from '@/hooks/useFormReset'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { useTransferFormValidation } from '@/hooks/useTransferFormValidation'
import type { TransferFormInputValues } from '@/schemas/transfer'
import { transferFormSchema } from '@/schemas/transfer'

export const Transfer = () => {
  const [transferCompleted, setTransferCompleted] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  // Track which fields have been touched/edited after submit attempt
  const [touchedFields, setTouchedFields] = useState<Set<keyof TransferFormInputValues>>(new Set())

  // Form manages all form state including selections
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

  // Track form values for reactivity - subscribe to form store changes
  // This ensures components re-render when form state changes
  const [formValues, setFormValues] = useState(form.state.values)
  const prevAssetIdRef = useRef<string | null>(form.state.values.asset?.id ?? null)

  useEffect(() => {
    // Subscribe to form store changes - form.store is reactive
    const unsubscribe = form.store.subscribe(() => {
      const newValues = { ...form.state.values }
      setFormValues(newValues)

      // Clear dependent fields when asset changes
      const newAssetId = newValues.asset?.id ?? null
      if (prevAssetIdRef.current !== newAssetId && prevAssetIdRef.current !== null) {
        form.setFieldValue('vault', null)
        form.setFieldValue('toAddress', null)
        form.setFieldValue('amount', '0.00')
      }
      prevAssetIdRef.current = newAssetId
    })
    return unsubscribe
  }, [form])

  // Step navigation logic - reads from form state
  const { activeStep, handleStepClick } = useStepNavigation({
    selectedAsset: formValues.asset,
    selectedVault: formValues.vault,
  })

  // Form reset logic
  const { resetForm } = useFormReset({
    form,
    setters: {
      setTransferCompleted,
      setHasAttemptedSubmit,
      setTouchedFields: (fields) => setTouchedFields(fields as Set<keyof TransferFormInputValues>),
    },
  })

  // Form validation logic - reads from form state
  const {
    assetError,
    vaultError,
    toAddressError,
    amountError,
    memoError,
    assetErrorMessage,
    vaultErrorMessage,
    toAddressErrorMessage,
    amountErrorMessage,
    memoErrorMessage,
    validateForm,
  } = useTransferFormValidation({
    form: { state: { values: formValues } },
    hasAttemptedSubmit,
    touchedFields,
  })

  // Helper to mark field as touched when edited after submit
  const markFieldTouched = (fieldName: keyof TransferFormInputValues) => {
    if (hasAttemptedSubmit) {
      setTouchedFields((prev) => new Set(prev).add(fieldName))
    }
  }

  const handleStartOver = () => {
    resetForm()
  }

  const handleSubmitTransfer = async () => {
    setHasAttemptedSubmit(true)

    // Validate form using Zod schema - validation reads from form state
    const result = validateForm()

    if (result.success) {
      setTransferCompleted(true)
    }
    // Validation failed - errors will be shown via hasError props
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
      className="min-h-screen p-4 sm:p-8"
      style={{
        background: 'var(--color-gradient-background)',
      }}
    >
      <div className="mx-auto w-full max-w-[1200px]">
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
            <Typography variant="h3" className="mb-4 text-blue-1 sm:mb-8">
              Transfer
            </Typography>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[120px_1fr] sm:gap-12">
              {/* Left Column - Stepper (hidden on mobile) */}
              <div className="hidden sm:block">
                <Stepper activeStep={activeStep} />
              </div>

              {/* Right Column - Form Fields */}
              <div className="w-full space-y-4">
                {/* Asset Selector */}
                <form.Field name="asset">
                  {(field) => (
                    <AssetSelector
                      selectedAsset={field.state.value}
                      setSelectedAsset={(asset) => {
                        field.handleChange(asset)
                        markFieldTouched('asset')
                      }}
                      onFieldClick={() => handleStepClick(0)}
                      hasError={assetError}
                      validationError={assetErrorMessage}
                    />
                  )}
                </form.Field>
                {/* Vault Selector */}
                <form.Field name="vault">
                  {(field) => (
                    <VaultSelector
                      selectedVault={field.state.value}
                      setSelectedVault={(vault) => {
                        field.handleChange(vault)
                        markFieldTouched('vault')
                      }}
                      onFieldClick={() => handleStepClick(1)}
                      hasError={vaultError}
                      validationError={vaultErrorMessage}
                    />
                  )}
                </form.Field>
                {/* To Vault Selector */}
                <form.Field name="toAddress">
                  {(field) => (
                    <ToVaultSelector
                      selectedAsset={formValues.asset}
                      selectedAddress={field.state.value}
                      setSelectedAddress={(address) => {
                        field.handleChange(address)
                        markFieldTouched('toAddress')
                      }}
                      onFieldClick={() => handleStepClick(2)}
                      hasError={toAddressError}
                      validationError={toAddressErrorMessage}
                    />
                  )}
                </form.Field>
                {/* Amount Selector */}
                <form.Field name="amount">
                  {(field) => (
                    <AmountSelector
                      selectedAsset={formValues.asset}
                      selectedVault={formValues.vault}
                      amount={field.state.value}
                      setAmount={(value) => {
                        field.handleChange(value)
                        markFieldTouched('amount')
                      }}
                      onFieldClick={() => handleStepClick(3)}
                      hasError={amountError}
                      validationError={amountErrorMessage}
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
                        markFieldTouched('memo')
                      }}
                      onFieldClick={() => handleStepClick(4)}
                      hasError={memoError}
                      validationError={memoErrorMessage}
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
