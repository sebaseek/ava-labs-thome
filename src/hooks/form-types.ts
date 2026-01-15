import type { TransferFormInputValues } from '@/schemas/transfer'

// Minimal form interface that matches what we actually use
// Using a more permissive type to work with TanStack Form's complex type system
export type FormType = {
  reset: () => void
  setFieldValue: (...args: unknown[]) => void
  state: {
    values: TransferFormInputValues
  }
}
