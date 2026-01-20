import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'

/**
 * Zod validation error structure returned by TanStack Form's Standard Schema validation
 */
export interface ZodFieldError {
  code: string
  path: (string | number)[]
  message: string
}

/**
 * Field render prop type for each form field
 * Uses the same shape as TanStack Form's FieldApi including meta for validation errors
 * Note: With Standard Schema validation, errors are ZodFieldError objects, not plain strings
 */
export interface FieldRenderProps<T> {
  state: {
    value: T
    meta: {
      errors: ZodFieldError[]
      isTouched: boolean
      isValidating: boolean
    }
  }
  handleChange: (value: T) => void
  handleBlur: () => void
}

/**
 * Helper to extract error message from Zod field errors
 */
export const getFieldErrorMessage = (errors: ZodFieldError[]): string | null => {
  if (errors.length === 0) return null
  return errors[0]?.message || null
}

/**
 * Common props shared across all form field components
 *
 * Note: We use `any` for the form prop because TanStack Form v1.19+ has extremely
 * complex generic types (12+ type parameters) that are difficult to express in a reusable
 * interface. The actual type safety is preserved through explicit typing of the field
 * render props within each component.
 *
 * With Standard Schema validation, validation errors come from field.state.meta.errors
 * so we no longer need hasError/validationError props passed from parent.
 */
export interface FormFieldCommonProps {
  /* TanStack Form's generic types are too complex to express in a reusable interface */
  form: any
  onFieldClick: () => void
  /** API submission errors (e.g., insufficient balance from server) */
  submissionError: { field?: string; message: string } | null
  clearSubmissionError: (field: string) => void
}

// Re-export field value types for convenience
export type { Asset, Vault, Address }
