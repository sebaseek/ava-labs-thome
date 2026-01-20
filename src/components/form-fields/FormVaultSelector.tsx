import type { TransferFormInputValues } from '@/schemas/transfer'
import { vaultSchema } from '@/schemas/transfer'
import { VaultSelector } from '../VaultSelector'
import type { Asset, FieldRenderProps, FormFieldCommonProps, Vault } from './types'
import { getFieldErrorMessage } from './types'

type FormVaultSelectorProps = FormFieldCommonProps

export const FormVaultSelector = ({
  form,
  onFieldClick,
  submissionError,
  clearSubmissionError,
}: FormVaultSelectorProps) => {
  return (
    <form.Field
      name="vault"
      validators={{
        onSubmit: vaultSchema,
      }}
    >
      {(field: FieldRenderProps<Vault | null>) => {
        // Get validation errors from TanStack Form + Standard Schema
        const fieldErrors = field.state.meta.errors
        const hasFieldError = fieldErrors.length > 0
        const hasSubmissionError = submissionError?.field === 'vaultId'
        const hasError = hasFieldError || hasSubmissionError
        const validationError = hasSubmissionError
          ? submissionError.message
          : getFieldErrorMessage(fieldErrors)

        return (
          <form.Subscribe
            selector={(state: { values: TransferFormInputValues }) => state.values.asset}
          >
            {(asset: Asset | null) => (
              <VaultSelector
                selectedVault={field.state.value}
                setSelectedVault={(vault) => {
                  field.handleChange(vault)
                  if (hasSubmissionError) {
                    clearSubmissionError('vaultId')
                  }
                }}
                selectedAsset={asset}
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
