import { useForm } from '@tanstack/react-form'
import { useEffect, useRef, useState } from 'react'
import { parseUnits } from 'viem'
import { submitTransfer } from '@/api/submit-transfer'
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
  // Track submission errors from API (e.g., insufficient balance)
  const [submissionError, setSubmissionError] = useState<{
    field?: string
    message: string
  } | null>(null)

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
      setSubmissionError: () => setSubmissionError(null),
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
    setSubmissionError(null) // Clear any previous submission errors

    // Validate form using Zod schema - validation reads from form state
    const result = validateForm()

    if (!result.success) {
      // Validation failed - errors will be shown via hasError props
      return
    }

    // All form fields are validated, so we can safely access them
    const { asset, vault, toAddress, amount, memo } = formValues

    if (!asset || !vault || !toAddress) {
      // This shouldn't happen if validation passed, but TypeScript needs this check
      return
    }

    try {
      // Convert amount from human-readable format (e.g., "100.50") to smallest units (e.g., "100500000000000000000")
      const amountWithoutCommas = amount.replace(/,/g, '')
      const amountInSmallestUnits = parseUnits(amountWithoutCommas, asset.decimals)

      // Submit the transfer
      await submitTransfer({
        vaultId: vault.id,
        accountIndex: 0, // Using account index 0 for the source vault
        assetId: asset.id,
        amount: amountInSmallestUnits.toString(),
        to: toAddress.address,
        memo: memo.trim(),
      })

      // Transfer submitted successfully
      setTransferCompleted(true)
    } catch (error) {
      // Handle transfer submission errors
      // The submitTransfer function throws TransferValidationError for validation issues
      // and other errors for network/API issues
      console.error('Transfer submission failed:', error)

      // Check if it's a TransferValidationError with a field
      if (error instanceof Error && error.name === 'TransferValidationError') {
        const validationError = error as { field?: string; message: string }
        setSubmissionError({
          field: validationError.field,
          message: validationError.message,
        })
      } else {
        // Generic error
        setSubmissionError({
          message:
            error instanceof Error
              ? error.message
              : 'Transfer submission failed. Please try again.',
        })
      }
      // Don't navigate to success screen on error
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
                        if (submissionError?.field === 'assetId') {
                          setSubmissionError(null)
                        }
                      }}
                      onFieldClick={() => handleStepClick(0)}
                      hasError={assetError || submissionError?.field === 'assetId'}
                      validationError={
                        submissionError?.field === 'assetId'
                          ? submissionError.message
                          : assetErrorMessage
                      }
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
                        if (submissionError?.field === 'vaultId') {
                          setSubmissionError(null)
                        }
                      }}
                      selectedAsset={formValues.asset}
                      onFieldClick={() => handleStepClick(1)}
                      hasError={vaultError || submissionError?.field === 'vaultId'}
                      validationError={
                        submissionError?.field === 'vaultId'
                          ? submissionError.message
                          : vaultErrorMessage
                      }
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
                        if (submissionError?.field === 'to') {
                          setSubmissionError(null)
                        }
                      }}
                      selectedVault={formValues.vault}
                      onFieldClick={() => handleStepClick(2)}
                      hasError={toAddressError || submissionError?.field === 'to'}
                      validationError={
                        submissionError?.field === 'to'
                          ? submissionError.message
                          : toAddressErrorMessage
                      }
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
                        // Clear submission error when user edits amount
                        if (submissionError?.field === 'amount') {
                          setSubmissionError(null)
                        }
                      }}
                      onFieldClick={() => handleStepClick(3)}
                      hasError={amountError || submissionError?.field === 'amount'}
                      validationError={
                        submissionError?.field === 'amount'
                          ? submissionError.message
                          : amountErrorMessage
                      }
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
                        if (submissionError?.field === 'memo') {
                          setSubmissionError(null)
                        }
                      }}
                      onFieldClick={() => handleStepClick(4)}
                      hasError={memoError || submissionError?.field === 'memo'}
                      validationError={
                        submissionError?.field === 'memo'
                          ? submissionError.message
                          : memoErrorMessage
                      }
                    />
                  )}
                </form.Field>
                {/* General Error Message (for non-field-specific errors) */}
                {submissionError && !submissionError.field && (
                  <div className="rounded-lg border border-red-highlight-1 bg-red-highlight-1-transparency-10 p-4">
                    <p className="text-sm font-medium leading-[120%] text-red-highlight-1">
                      {submissionError.message}
                    </p>
                  </div>
                )}
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
