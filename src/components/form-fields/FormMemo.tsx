import { Memo } from '../Memo'
import type { FieldRenderProps, FormFieldCommonProps } from './types'

type FormMemoProps = FormFieldCommonProps

export const FormMemo = ({
  form,
  onFieldClick,
  hasError,
  validationError,
  submissionError,
  clearSubmissionError,
}: FormMemoProps) => {
  return (
    <form.Field name="memo">
      {(field: FieldRenderProps<string>) => (
        <Memo
          value={field.state.value}
          onChange={(value) => {
            field.handleChange(value)
            if (submissionError?.field === 'memo') {
              clearSubmissionError('memo')
            }
          }}
          onFieldClick={onFieldClick}
          hasError={hasError || submissionError?.field === 'memo'}
          validationError={
            submissionError?.field === 'memo' ? submissionError.message : validationError
          }
        />
      )}
    </form.Field>
  )
}
