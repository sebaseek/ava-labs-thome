import { z } from 'zod'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'

/**
 * Individual field schemas for use with TanStack Form's field-level validation
 * These are used by TanStack Form's Standard Schema support for real-time validation
 */
export const assetSchema = z.custom<Asset>(
  (val): val is Asset => val !== null && typeof val === 'object' && 'id' in val,
  { message: 'Please select an asset to continue' },
)

export const vaultSchema = z.custom<Vault>(
  (val): val is Vault => val !== null && typeof val === 'object' && 'id' in val,
  { message: 'Please select a source vault' },
)

export const toAddressSchema = z.custom<Address>(
  (val): val is Address => val !== null && typeof val === 'object' && 'address' in val,
  { message: 'Please select a destination address' },
)

export const amountSchema = z
  .string()
  .min(1, 'Please enter an amount')
  .refine(
    (val) => {
      const cleaned = val.replace(/,/g, '')
      const num = parseFloat(cleaned)
      return (
        !Number.isNaN(num) && num > 0 && cleaned !== '0' && cleaned !== '0.00' && cleaned !== '0.'
      )
    },
    { message: 'Please enter an amount greater than zero' },
  )

export const memoSchema = z
  .string()
  .min(1, 'Please enter a memo')
  .max(256, 'Memo must be 256 characters or less')

/**
 * Zod schema for transfer form validation
 * Provides centralized, type-safe validation for all form fields
 * Used for form-level validation on submit
 */
export const transferFormSchema = z.object({
  asset: assetSchema,
  vault: vaultSchema,
  toAddress: toAddressSchema,
  amount: amountSchema,
  memo: memoSchema,
})

export type TransferFormValues = z.infer<typeof transferFormSchema>

/**
 * Form input values type - allows nulls for fields that haven't been selected yet
 * This matches what the form actually uses internally before validation
 */
export type TransferFormInputValues = {
  asset: Asset | null
  vault: Vault | null
  toAddress: Address | null
  amount: string
  memo: string
}
