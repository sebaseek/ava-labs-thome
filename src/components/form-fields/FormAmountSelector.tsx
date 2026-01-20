import type { TransferFormInputValues } from '@/schemas/transfer'
import { amountSchema } from '@/schemas/transfer'
import { AmountSelector } from '../AmountSelector'
import type { Asset, FieldRenderProps, FormFieldCommonProps, Vault } from './types'
import { getFieldErrorMessage } from './types'

type FormAmountSelectorProps = FormFieldCommonProps

export const FormAmountSelector = ({
  form,
  onFieldClick,
  submissionError,
  clearSubmissionError,
}: FormAmountSelectorProps) => {
  return (
    <form.Field
      name="amount"
      validators={{
        onSubmit: amountSchema,
      }}
    >
      {(field: FieldRenderProps<string>) => {
        // Get validation errors from TanStack Form + Standard Schema
        const fieldErrors = field.state.meta.errors
        const hasFieldError = fieldErrors.length > 0
        const hasSubmissionError = submissionError?.field === 'amount'
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
              <AmountSelector
                selectedAsset={asset}
                selectedVault={vault}
                amount={field.state.value}
                setAmount={(value) => {
                  field.handleChange(value)
                  if (hasSubmissionError) {
                    clearSubmissionError('amount')
                  }
                }}
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
