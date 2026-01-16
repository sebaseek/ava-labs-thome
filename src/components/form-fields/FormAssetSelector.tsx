import { AssetSelector } from '../AssetSelector'
import type { Asset, FieldRenderProps, FormFieldCommonProps } from './types'

type FormAssetSelectorProps = FormFieldCommonProps

export const FormAssetSelector = ({
  form,
  onFieldClick,
  hasError,
  validationError,
  submissionError,
  clearSubmissionError,
}: FormAssetSelectorProps) => {
  return (
    <form.Field name="asset">
      {(field: FieldRenderProps<Asset | null>) => (
        <AssetSelector
          selectedAsset={field.state.value}
          setSelectedAsset={(asset) => {
            field.handleChange(asset)
            if (submissionError?.field === 'assetId') {
              clearSubmissionError('assetId')
            }
          }}
          onFieldClick={onFieldClick}
          hasError={hasError || submissionError?.field === 'assetId'}
          validationError={
            submissionError?.field === 'assetId' ? submissionError.message : validationError
          }
        />
      )}
    </form.Field>
  )
}
