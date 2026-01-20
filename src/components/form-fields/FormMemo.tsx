import { memoSchema } from '@/schemas/transfer'
import { Memo } from '../Memo'
import type { FieldRenderProps, FormFieldCommonProps } from './types'
import { getFieldErrorMessage } from './types'

type FormMemoProps = FormFieldCommonProps

export const FormMemo = ({
  form,
  onFieldClick,
  submissionError,
  clearSubmissionError,
}: FormMemoProps) => {
  return (
    <form.Field
      name="memo"
      validators={{
        onSubmit: memoSchema,
      }}
    >
      {(field: FieldRenderProps<string>) => {
        // Get validation errors from TanStack Form + Standard Schema
        const fieldErrors = field.state.meta.errors
        const hasFieldError = fieldErrors.length > 0
        const hasSubmissionError = submissionError?.field === 'memo'
        const hasError = hasFieldError || hasSubmissionError
        const validationError = hasSubmissionError
          ? submissionError.message
          : getFieldErrorMessage(fieldErrors)

        return (
          <Memo
            value={field.state.value}
            onChange={(value) => {
              field.handleChange(value)
              if (hasSubmissionError) {
                clearSubmissionError('memo')
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
