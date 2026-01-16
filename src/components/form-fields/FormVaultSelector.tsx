import type { TransferFormInputValues } from '@/schemas/transfer'
import { VaultSelector } from '../VaultSelector'
import type { Asset, FieldRenderProps, FormFieldCommonProps, Vault } from './types'

type FormVaultSelectorProps = FormFieldCommonProps

export const FormVaultSelector = ({
  form,
  onFieldClick,
  hasError,
  validationError,
  submissionError,
  clearSubmissionError,
}: FormVaultSelectorProps) => {
  return (
    <form.Field name="vault">
      {(field: FieldRenderProps<Vault | null>) => (
        <form.Subscribe
          selector={(state: { values: TransferFormInputValues }) => state.values.asset}
        >
          {(asset: Asset | null) => (
            <VaultSelector
              selectedVault={field.state.value}
              setSelectedVault={(vault) => {
                field.handleChange(vault)
                if (submissionError?.field === 'vaultId') {
                  clearSubmissionError('vaultId')
                }
              }}
              selectedAsset={asset}
              onFieldClick={onFieldClick}
              hasError={hasError || submissionError?.field === 'vaultId'}
              validationError={
                submissionError?.field === 'vaultId' ? submissionError.message : validationError
              }
            />
          )}
        </form.Subscribe>
      )}
    </form.Field>
  )
}
