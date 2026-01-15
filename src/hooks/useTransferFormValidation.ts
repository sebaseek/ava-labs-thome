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
  validateForm: () => ReturnType<typeof transferFormSchema.safeParse>
}

/**
 * Hook for managing transfer form validation
 * Reads directly from form state - single source of truth
 */
export const useTransferFormValidation = ({
  form,
  hasAttemptedSubmit,
  touchedFields,
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
  // 1. Submit was attempted AND field hasn't been touched yet, OR
  // 2. Field has been touched but still has a validation error
  const shouldShowError = (fieldName: keyof TransferFormInputValues): boolean => {
    if (!hasAttemptedSubmit) return false
    const hasError = !!fieldErrors[fieldName]
    const isTouched = touchedFields.has(fieldName)
    // Show error if: (not touched yet) OR (touched but still has error)
    return !isTouched || (isTouched && hasError)
  }

  const assetError = shouldShowError('asset')
  const vaultError = shouldShowError('vault')
  const toAddressError = shouldShowError('toAddress')
  const amountError = shouldShowError('amount')

  return {
    fieldErrors,
    assetError,
    vaultError,
    toAddressError,
    amountError,
    validateForm,
  }
}
