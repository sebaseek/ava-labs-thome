import type { TransferFormInputValues } from '@/schemas/transfer'
import { AmountSelector } from '../AmountSelector'
import type { Asset, FieldRenderProps, FormFieldCommonProps, Vault } from './types'

type FormAmountSelectorProps = FormFieldCommonProps

export const FormAmountSelector = ({
  form,
  onFieldClick,
  hasError,
  validationError,
  submissionError,
  clearSubmissionError,
}: FormAmountSelectorProps) => {
  return (
    <form.Field name="amount">
      {(field: FieldRenderProps<string>) => (
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
                if (submissionError?.field === 'amount') {
                  clearSubmissionError('amount')
                }
              }}
              onFieldClick={onFieldClick}
              hasError={hasError || submissionError?.field === 'amount'}
              validationError={
                submissionError?.field === 'amount' ? submissionError.message : validationError
              }
            />
          )}
        </form.Subscribe>
      )}
    </form.Field>
  )
}
