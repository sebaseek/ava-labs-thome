import { useCallback, useMemo } from 'react'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import { type TransferFormValues, transferFormSchema } from '@/schemas/transfer'
import type { FormType } from './form-types'

interface UseTransferFormValidationOptions {
  form: FormType
  selectedAsset: Asset | null
  selectedVault: Vault | null
  selectedAddress: Address | null
  hasAttemptedSubmit: boolean
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
 * Centralizes validation logic and error state management
 */
export const useTransferFormValidation = ({
  form,
  selectedAsset,
  selectedVault,
  selectedAddress,
  hasAttemptedSubmit,
}: UseTransferFormValidationOptions): UseTransferFormValidationReturn => {
  // Validate form values using Zod schema
  const validateForm = useCallback(() => {
    const currentValues = {
      ...form.state.values,
      asset: selectedAsset,
      vault: selectedVault,
      toAddress: selectedAddress,
    }
    return transferFormSchema.safeParse(currentValues)
  }, [form.state.values, selectedAsset, selectedVault, selectedAddress])

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

  const assetError = hasAttemptedSubmit && !!fieldErrors.asset
  const vaultError = hasAttemptedSubmit && !!fieldErrors.vault
  const toAddressError = hasAttemptedSubmit && !!fieldErrors.toAddress
  const amountError = hasAttemptedSubmit && !!fieldErrors.amount

  return {
    fieldErrors,
    assetError,
    vaultError,
    toAddressError,
    amountError,
    validateForm,
  }
}
