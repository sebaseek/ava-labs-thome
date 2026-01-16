import { useCallback } from 'react'

interface UseFormResetOptions {
  form: {
    reset: () => void
    setFieldValue: (name: any, value: any) => void
  }
  setters: {
    setTransferCompleted: (completed: boolean) => void
    setHasAttemptedSubmit: (attempted: boolean) => void
    setTouchedFields?: (fields: Set<string> | Set<keyof any>) => void
    setSubmissionError?: () => void
  }
}

/**
 * Hook for resetting the transfer form and all related state
 * Resets all form fields including selections - single source of truth
 */
export const useFormReset = ({ form, setters }: UseFormResetOptions) => {
  const resetForm = useCallback(() => {
    // Reset all form fields including selections
    form.reset()
    form.setFieldValue('asset', null)
    form.setFieldValue('vault', null)
    form.setFieldValue('toAddress', null)
    form.setFieldValue('amount', '0.00')
    form.setFieldValue('memo', '')

    // Reset UI state
    setters.setTransferCompleted(false)
    setters.setHasAttemptedSubmit(false)
    setters.setTouchedFields?.(new Set())
    setters.setSubmissionError?.()
  }, [form, setters])

  return { resetForm }
}
