import { assetSchema } from '@/schemas/transfer'
import { AssetSelector } from '../AssetSelector'
import type { Asset, FieldRenderProps, FormFieldCommonProps } from './types'
import { getFieldErrorMessage } from './types'

type FormAssetSelectorProps = FormFieldCommonProps

export const FormAssetSelector = ({
  form,
  onFieldClick,
  submissionError,
  clearSubmissionError,
}: FormAssetSelectorProps) => {
  return (
    <form.Field
      name="asset"
      validators={{
        onSubmit: assetSchema,
      }}
    >
      {(field: FieldRenderProps<Asset | null>) => {
        // Get validation errors from TanStack Form + Standard Schema
        const fieldErrors = field.state.meta.errors
        const hasFieldError = fieldErrors.length > 0
        const hasSubmissionError = submissionError?.field === 'assetId'
        const hasError = hasFieldError || hasSubmissionError
        const validationError = hasSubmissionError
          ? submissionError.message
          : getFieldErrorMessage(fieldErrors)

        return (
          <AssetSelector
            selectedAsset={field.state.value}
            setSelectedAsset={(asset) => {
              field.handleChange(asset)
              if (hasSubmissionError) {
                clearSubmissionError('assetId')
              }
            }}
            onFieldClick={onFieldClick}
            hasError={hasError}
            validationError={validationError}
          />
        )
      }}
    </form.Field>
  )
}
