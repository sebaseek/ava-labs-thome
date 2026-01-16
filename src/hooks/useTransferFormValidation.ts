import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TransferFormInputValues } from '@/schemas/transfer'
import { type TransferFormValues, transferFormSchema } from '@/schemas/transfer'

interface UseTransferFormValidationOptions {
  form: {
    state: {
      values: TransferFormInputValues
    }
    store: {
      subscribe: (callback: () => void) => () => void
    }
  }
  hasAttemptedSubmit: boolean
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
}

/**
 * Hook for managing transfer form validation
 * Reads directly from form state - single source of truth
 * Uses Zod schema for validation
 * Subscribes to form state changes to reactively update validation errors
 */
export const useTransferFormValidation = ({
  form,
  hasAttemptedSubmit,
}: UseTransferFormValidationOptions): UseTransferFormValidationReturn => {
  // Track form values reactively by subscribing to form store changes
  // This ensures validation re-runs when form values change
  const [formValues, setFormValues] = useState(form.state.values)

  useEffect(() => {
    // Subscribe to form store changes to update local state
    const unsubscribe = form.store.subscribe(() => {
      setFormValues({ ...form.state.values })
    })
    return unsubscribe
  }, [form])

  // Validate form values using Zod schema - reads from reactive form values
  const validateForm = useCallback(() => {
    return transferFormSchema.safeParse(formValues)
  }, [formValues])

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

  // Show error for a field only if submit was attempted AND field has a validation error
  const shouldShowError = (fieldName: keyof TransferFormInputValues): boolean => {
    if (!hasAttemptedSubmit) return false
    return !!fieldErrors[fieldName]
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
  }
}
