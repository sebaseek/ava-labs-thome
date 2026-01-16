import type { TransferFormInputValues } from '@/schemas/transfer'
import { ToVaultSelector } from '../ToVaultSelector'
import type { Address, Asset, FieldRenderProps, FormFieldCommonProps, Vault } from './types'

type FormToVaultSelectorProps = FormFieldCommonProps

export const FormToVaultSelector = ({
  form,
  onFieldClick,
  hasError,
  validationError,
  submissionError,
  clearSubmissionError,
}: FormToVaultSelectorProps) => {
  return (
    <form.Field name="toAddress">
      {(field: FieldRenderProps<Address | null>) => (
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
                if (submissionError?.field === 'to') {
                  clearSubmissionError('to')
                }
              }}
              selectedVault={vault}
              onFieldClick={onFieldClick}
              hasError={hasError || submissionError?.field === 'to'}
              validationError={
                submissionError?.field === 'to' ? submissionError.message : validationError
              }
            />
          )}
        </form.Subscribe>
      )}
    </form.Field>
  )
}
