import { useCallback, useMemo } from 'react'
import type { TransferFormInputValues } from '@/schemas/transfer'
import { type TransferFormValues, transferFormSchema } from '@/schemas/transfer'

interface UseTransferFormValidationOptions {
  form: {
    state: {
      values: TransferFormInputValues
    }
  }
  hasAttemptedSubmit: boolean
  touchedFields: Set<keyof TransferFormInputValues>
}

interface UseTransferFormValidationReturn {
  fieldErrors: Partial<Record<keyof TransferFormValues, string>>
  assetError: boolean
  vaultError: boolean
  toAddressError: boolean
  amountError: boolean
  memoError: boolean
  assetErrorMessage: string | null
  vaultErrorMessage: string | null
  toAddressErrorMessage: string | null
  amountErrorMessage: string | null
  memoErrorMessage: string | null
  validateForm: () => ReturnType<typeof transferFormSchema.safeParse>
}

/**
 * Hook for managing transfer form validation
 * Reads directly from form state - single source of truth
 */
export const useTransferFormValidation = ({
  form,
  hasAttemptedSubmit,
  touchedFields: _touchedFields,
}: UseTransferFormValidationOptions): UseTransferFormValidationReturn => {
  // Validate form values using Zod schema - reads from form state
  const validateForm = useCallback(() => {
    return transferFormSchema.safeParse(form.state.values)
  }, [form.state.values])

  // Only validate and show errors if user has attempted to submit
  const fieldErrors: Partial<Record<keyof TransferFormValues, string>> = useMemo(() => {
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
  }, [hasAttemptedSubmit, validateForm])

  // Show error for a field only if:
  // 1. Submit was attempted AND field has a validation error
  // 2. Once a field is touched and fixed, the error clears automatically (hasError becomes false)
  const shouldShowError = (fieldName: keyof TransferFormInputValues): boolean => {
    if (!hasAttemptedSubmit) return false
    const hasError = !!fieldErrors[fieldName]
    // Only show error if field actually has a validation error
    // The touched state is used to track user interaction, but errors are shown based on actual validation state
    return hasError
  }

  const assetError = shouldShowError('asset')
  const vaultError = shouldShowError('vault')
  const toAddressError = shouldShowError('toAddress')
  const amountError = shouldShowError('amount')
  const memoError = shouldShowError('memo')

  // Get error messages for fields that should show errors
  const assetErrorMessage = assetError ? fieldErrors.asset || null : null
  const vaultErrorMessage = vaultError ? fieldErrors.vault || null : null
  const toAddressErrorMessage = toAddressError ? fieldErrors.toAddress || null : null
  const amountErrorMessage = amountError ? fieldErrors.amount || null : null
  const memoErrorMessage = memoError ? fieldErrors.memo || null : null

  return {
    fieldErrors,
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
  }
}
