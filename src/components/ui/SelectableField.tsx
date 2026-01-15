import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../utils'
import { Card } from './Card'
import { Text } from './Text'

export type SelectableFieldProps = {
  label: string
  isOpen: boolean
  onToggle: () => void
  isLoading?: boolean
  error?: boolean | Error | null
  content?: ReactNode
  placeholder?: string
  loadingMessage?: string
  errorMessage?: string
  children?: ReactNode
  showExpandedContent?: boolean
  hasError?: boolean
  validationError?: string | null
}

const getErrorMessage = (error: boolean | Error | null, defaultMessage: string): string => {
  if (!error) return defaultMessage
  if (error instanceof Error) return error.message
  return defaultMessage
}

const SelectableField = ({
  label,
  isOpen,
  onToggle,
  isLoading = false,
  error = false,
  content,
  placeholder,
  loadingMessage = 'Loading...',
  errorMessage = 'An error occurred',
  children,
  showExpandedContent = true,
  hasError = false,
  validationError,
}: SelectableFieldProps) => {
  const canInteract = !isLoading && !error
  const showValidationError = hasError && validationError

  return (
    <>
      <Card
        className={cn(
          // Hover state - only when closed and can interact
          !isOpen && canInteract && 'hover:bg-white',
          // Shadow only when focused
          'focus-within:shadow-[0px_4px_20px_0px_rgba(104,129,153,0.3)]',
        )}
        hover={false}
        hasError={hasError}
      >
        {/* Button */}
        <button
          type="button"
          onClick={() => canInteract && onToggle()}
          disabled={!canInteract}
          className={cn(
            'flex h-[80px] w-full items-center justify-between px-4 py-[15px] sm:px-[25px]',
            'transition-colors duration-200',
            isLoading && 'cursor-wait',
            error && 'cursor-not-allowed',
          )}
        >
          {/* Left: Label + Content */}
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-[80px]">
            <span className="w-[60px] shrink-0 text-left text-base font-semibold leading-[19px] text-blue-1 sm:w-[120px]">
              {label}
            </span>

            {isLoading && !error && !showValidationError && (
              <span className="text-base font-medium leading-[120%] text-blue-5">
                {loadingMessage}
              </span>
            )}

            {error && !showValidationError && (
              <div className="flex items-center gap-2">
                <span className="text-base font-medium leading-[120%] text-white">
                  {getErrorMessage(error, errorMessage)}
                </span>
                <AlertTriangle className="h-5 w-5 stroke-[1.4px] text-red-highlight-1" />
              </div>
            )}

            {canInteract && content && content}
            {canInteract && !content && placeholder && (
              <Text size="base" weight="medium" leading="tight" active={isOpen}>
                {placeholder}
              </Text>
            )}
          </div>

          {/* Right: Icon */}
          {isLoading && !error && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-5" />}
          {canInteract &&
            (isOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-blue-1" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-blue-1" />
            ))}
        </button>

        {/* Expanded Content */}
        {isOpen && showExpandedContent && children && (
          <div className="ml-0 px-4 pb-6 pt-4 sm:ml-[200px] sm:px-[25px]">{children}</div>
        )}
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

export { SelectableField }
