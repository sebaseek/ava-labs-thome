import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'

/**
 * Field render prop type for each form field
 * Uses the same shape as TanStack Form's FieldApi but only the properties we need
 */
export interface FieldRenderProps<T> {
  state: { value: T }
  handleChange: (value: T) => void
}

/**
 * Common props shared across all form field components
 *
 * Note: We use `unknown` for the form prop because TanStack Form v1.19+ has extremely
 * complex generic types (12+ type parameters) that are difficult to express in a reusable
 * interface. The actual type safety is preserved through explicit typing of the field
 * render props within each component.
 */
export interface FormFieldCommonProps {
  /* TanStack Form's generic types are too complex to express in a reusable interface */
  form: any
  onFieldClick: () => void
  hasError: boolean
  validationError: string | null
  submissionError: { field?: string; message: string } | null
  clearSubmissionError: (field: string) => void
}

// Re-export field value types for convenience
export type { Asset, Vault, Address }
