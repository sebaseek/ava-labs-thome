import { useForm } from '@tanstack/react-form'
import { useCallback, useEffect, useRef, useState } from 'react'
import { parseUnits } from 'viem'
import { submitTransfer } from '@/api/submit-transfer'
import {
  FormAmountSelector,
  FormAssetSelector,
  FormMemo,
  FormToVaultSelector,
  FormVaultSelector,
  NavigationControl,
  Stepper,
  TransferSuccess,
  Typography,
} from '@/components'
import { TransferFormSkeleton } from '@/components/TransferFormSkeleton'
import { useFormReset } from '@/hooks/useFormReset'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { useTransferFormValidation } from '@/hooks/useTransferFormValidation'
import type { TransferFormInputValues } from '@/schemas/transfer'
import { transferFormSchema } from '@/schemas/transfer'

export const Transfer = () => {
  const [transferCompleted, setTransferCompleted] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Track submission errors from API (e.g., insufficient balance)
  const [submissionError, setSubmissionError] = useState<{
    field?: string
    message: string
  } | null>(null)

  // Submission handler - extracted to be called after validation
  const handleFormSubmit = async (value: TransferFormInputValues) => {
    // Prevent double submission
    if (isSubmitting) return

    setSubmissionError(null) // Clear any previous submission errors
    setIsSubmitting(true)

    try {
      // All form fields are validated before this is called
      const { asset, vault, toAddress, amount, memo } = value

      if (!asset || !vault || !toAddress) {
        // This shouldn't happen if validation passed, but TypeScript needs this check
        return
      }

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
        const validationError = error as { field?: string; message: string; code?: string }

        // Don't show submission error for INSUFFICIENT_BALANCE on amount field
        // since the amount field already displays this error
        if (validationError.code === 'INSUFFICIENT_BALANCE' && validationError.field === 'amount') {
          // Amount field already shows the error, don't show duplicate message
          return
        }

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
    } finally {
      setIsSubmitting(false)
    }
  }

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
      await handleFormSubmit(value)
    },
  })

  // Track asset changes to clear dependent fields
  const prevAssetIdRef = useRef<string | null>(form.state.values.asset?.id ?? null)

  useEffect(() => {
    // Subscribe to form store changes to detect asset changes
    const unsubscribe = form.store.subscribe(() => {
      const newAssetId = form.state.values.asset?.id ?? null
      if (prevAssetIdRef.current !== newAssetId && prevAssetIdRef.current !== null) {
        form.setFieldValue('vault', null)
        form.setFieldValue('toAddress', null)
        form.setFieldValue('amount', '0.00')
      }
      prevAssetIdRef.current = newAssetId
    })
    return unsubscribe
  }, [form])

  // Step navigation logic - reads from form state directly
  const { activeStep, handleStepClick } = useStepNavigation({
    selectedAsset: form.state.values.asset,
    selectedVault: form.state.values.vault,
  })

  // Form reset logic
  const { resetForm } = useFormReset({
    form,
    setters: {
      setTransferCompleted,
      setHasAttemptedSubmit,
      setSubmissionError: () => setSubmissionError(null),
    },
  })

  // Form validation logic - reads from form state directly
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
  } = useTransferFormValidation({
    form: {
      state: form.state,
      store: form.store,
    },
    hasAttemptedSubmit,
  })

  const handleStartOver = () => {
    resetForm()
  }

  // Callback to clear submission errors for specific fields
  const clearSubmissionError = useCallback((_field: string) => {
    setSubmissionError(null)
  }, [])

  const handleSubmitTransfer = async () => {
    // Mark that submit was attempted so validation errors are shown
    setHasAttemptedSubmit(true)

    // Validate form using Zod schema
    const result = transferFormSchema.safeParse(form.state.values)
    if (!result.success) {
      // Validation failed - errors will be shown via validation hook
      return
    }

    // Validation passed - call submission handler directly
    await handleFormSubmit(form.state.values)
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

              {/* Right Column - Form Fields or Skeleton */}
              {isSubmitting ? (
                <TransferFormSkeleton />
              ) : (
                <div className="w-full space-y-4">
                  {/* Asset Selector */}
                  <FormAssetSelector
                    form={form}
                    onFieldClick={() => handleStepClick(0)}
                    hasError={assetError}
                    validationError={assetErrorMessage}
                    submissionError={submissionError}
                    clearSubmissionError={clearSubmissionError}
                  />

                  {/* Vault Selector */}
                  <FormVaultSelector
                    form={form}
                    onFieldClick={() => handleStepClick(1)}
                    hasError={vaultError}
                    validationError={vaultErrorMessage}
                    submissionError={submissionError}
                    clearSubmissionError={clearSubmissionError}
                  />

                  {/* To Vault Selector */}
                  <FormToVaultSelector
                    form={form}
                    onFieldClick={() => handleStepClick(2)}
                    hasError={toAddressError}
                    validationError={toAddressErrorMessage}
                    submissionError={submissionError}
                    clearSubmissionError={clearSubmissionError}
                  />

                  {/* Amount Selector */}
                  <FormAmountSelector
                    form={form}
                    onFieldClick={() => handleStepClick(3)}
                    hasError={amountError}
                    validationError={amountErrorMessage}
                    submissionError={submissionError}
                    clearSubmissionError={clearSubmissionError}
                  />

                  {/* Memo */}
                  <FormMemo
                    form={form}
                    onFieldClick={() => handleStepClick(4)}
                    hasError={memoError}
                    validationError={memoErrorMessage}
                    submissionError={submissionError}
                    clearSubmissionError={clearSubmissionError}
                  />
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
                    isSubmitting={isSubmitting}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
