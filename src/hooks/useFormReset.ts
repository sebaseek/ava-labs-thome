import type { FormApi } from '@tanstack/react-form'
import { useCallback } from 'react'
import type { TransferFormValues } from '@/schemas/transfer'

interface UseFormResetOptions {
  form: FormApi<TransferFormValues>
  setters: {
    setSelectedAsset: (asset: any) => void
    setSelectedVault: (vault: any) => void
    setSelectedAddress: (address: any) => void
    setTransferCompleted: (completed: boolean) => void
    setHasAttemptedSubmit: (attempted: boolean) => void
  }
}

/**
 * Hook for resetting the transfer form and all related state
 * Centralizes reset logic for consistent behavior
 */
export const useFormReset = ({ form, setters }: UseFormResetOptions) => {
  const resetForm = useCallback(() => {
    form.reset()
    form.setFieldValue('asset', null as any)
    form.setFieldValue('vault', null as any)
    form.setFieldValue('toAddress', null as any)
    form.setFieldValue('amount', '0.00')
    form.setFieldValue('memo', '')

    setters.setSelectedAsset(null)
    setters.setSelectedVault(null)
    setters.setSelectedAddress(null)
    setters.setTransferCompleted(false)
    setters.setHasAttemptedSubmit(false)
  }, [form, setters])

  return { resetForm }
}
