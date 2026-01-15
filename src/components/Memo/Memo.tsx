import { Card, FormField } from '@/components/ui'
import { cn } from '@/components/utils'

interface MemoProps {
  value: string
  onChange: (value: string) => void
  onFieldClick?: () => void
  hasError?: boolean
  validationError?: string | null
}

export const Memo = ({ value, onChange, onFieldClick, hasError = false, validationError }: MemoProps) => {
  const showValidationError = hasError && validationError

  return (
    <>
      <Card hasError={hasError}>
        <FormField label="Memo">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFieldClick}
            onClick={onFieldClick}
            placeholder="Enter a memo"
            className={cn(
              'h-[48px] w-full rounded-[8px] border bg-white pl-4 pr-4 py-1',
              'font-sans text-base font-medium leading-[120%]',
              'transition-colors duration-200 outline-none',
              hasError
                ? 'border-red-highlight-2 focus:border-red-highlight-2 focus:ring-2 focus:ring-red-highlight-2-transparency-40'
                : 'border-blue-5-transparency-30 focus:border-blue-5 focus:ring-2 focus:ring-blue-5/20',
              'placeholder:text-blue-5',
              value ? 'text-blue-1' : '',
            )}
          />
        </FormField>
      </Card>
      {/* Validation Error Message Below */}
      {showValidationError && (
        <div className="mt-2 flex items-center gap-2 px-4 sm:px-[25px]">
          <span className="text-sm font-medium leading-[120%] text-red-highlight-1">
            {validationError}
          </span>
        </div>
      )}
    </>
  )
}
