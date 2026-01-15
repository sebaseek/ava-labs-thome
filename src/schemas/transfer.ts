import { z } from 'zod'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'

/**
 * Zod schema for transfer form validation
 * Provides centralized, type-safe validation for all form fields
 */
export const transferFormSchema = z.object({
  asset: z
    .custom<Asset>((val) => val !== null && typeof val === 'object' && 'id' in val, {
      message: 'Please select an asset to continue',
    })
    .refine((val) => val !== null, {
      message: 'Please select an asset to continue',
    }),
  vault: z
    .custom<Vault>((val) => val !== null && typeof val === 'object' && 'id' in val, {
      message: 'Please select a source vault',
    })
    .refine((val) => val !== null, {
      message: 'Please select a source vault',
    }),
  toAddress: z
    .custom<Address>((val) => val !== null && typeof val === 'object' && 'address' in val, {
      message: 'Please select a destination address',
    })
    .refine((val) => val !== null, {
      message: 'Please select a destination address',
    }),
  amount: z
    .string()
    .min(1, 'Please enter an amount')
    .refine(
      (val) => {
        const cleaned = val.replace(/,/g, '')
        const num = parseFloat(cleaned)
        return !Number.isNaN(num) && num > 0
      },
      {
        message: 'Please enter an amount greater than zero',
      },
    )
    .refine(
      (val) => {
        const cleaned = val.replace(/,/g, '')
        return cleaned !== '0' && cleaned !== '0.00' && cleaned !== '0.'
      },
      {
        message: 'Please enter an amount greater than zero',
      },
    ),
  memo: z
    .string()
    .min(1, 'Please enter a memo')
    .max(256, 'Memo must be 256 characters or less'),
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
