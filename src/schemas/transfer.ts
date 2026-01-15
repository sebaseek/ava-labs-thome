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
      message: 'Asset is required',
    })
    .refine((val) => val !== null, {
      message: 'Please select an asset',
    }),
  vault: z
    .custom<Vault>((val) => val !== null && typeof val === 'object' && 'id' in val, {
      message: 'Vault is required',
    })
    .refine((val) => val !== null, {
      message: 'Please select a vault',
    }),
  toAddress: z
    .custom<Address>((val) => val !== null && typeof val === 'object' && 'address' in val, {
      message: 'Destination address is required',
    })
    .refine((val) => val !== null, {
      message: 'Please select a destination address',
    }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => {
        const cleaned = val.replace(/,/g, '')
        const num = parseFloat(cleaned)
        return !Number.isNaN(num) && num > 0
      },
      {
        message: 'Amount must be greater than zero',
      },
    )
    .refine(
      (val) => {
        const cleaned = val.replace(/,/g, '')
        return cleaned !== '0' && cleaned !== '0.00' && cleaned !== '0.'
      },
      {
        message: 'Amount must be greater than zero',
      },
    ),
  memo: z.string().max(256, 'Memo must be less than 256 characters').optional().default(''),
})

export type TransferFormValues = z.infer<typeof transferFormSchema>
