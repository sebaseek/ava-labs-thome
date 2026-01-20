import type { TransferFormInputValues } from '@/schemas/transfer'
import { toAddressSchema } from '@/schemas/transfer'
import { ToVaultSelector } from '../ToVaultSelector'
import type { Address, Asset, FieldRenderProps, FormFieldCommonProps, Vault } from './types'
import { getFieldErrorMessage } from './types'

type FormToVaultSelectorProps = FormFieldCommonProps

export const FormToVaultSelector = ({
  form,
  onFieldClick,
  submissionError,
  clearSubmissionError,
}: FormToVaultSelectorProps) => {
  return (
    <form.Field
      name="toAddress"
      validators={{
        onSubmit: toAddressSchema,
      }}
    >
      {(field: FieldRenderProps<Address | null>) => {
        // Get validation errors from TanStack Form + Standard Schema
        const fieldErrors = field.state.meta.errors
        const hasFieldError = fieldErrors.length > 0
        const hasSubmissionError = submissionError?.field === 'to'
        const hasError = hasFieldError || hasSubmissionError
        const validationError = hasSubmissionError
          ? submissionError.message
          : getFieldErrorMessage(fieldErrors)

        return (
          <form.Subscribe
            selector={(state: { values: TransferFormInputValues }) => ({
              asset: state.values.asset,
              vault: state.values.vault,
            })}
          >
            {({ asset, vault }: { asset: Asset | null; vault: Vault | null }) => (
              <ToVaultSelector
                selectedAsset={asset}
                selectedAddress={field.state.value}
                setSelectedAddress={(address) => {
                  field.handleChange(address)
                  if (hasSubmissionError) {
                    clearSubmissionError('to')
                  }
                }}
                selectedVault={vault}
                onFieldClick={onFieldClick}
                hasError={hasError}
                validationError={validationError}
              />
            )}
          </form.Subscribe>
        )
      }}
    </form.Field>
  )
}
