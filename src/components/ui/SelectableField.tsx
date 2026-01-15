import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../utils'
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
}: SelectableFieldProps) => {
  const canInteract = !isLoading && !error

  return (
    <div
      className={cn(
        'w-full rounded-[12px] border border-card-border',
        'bg-white-transparency-40 backdrop-blur-[40px]',
        'overflow-hidden transition-all duration-200',
        // Hover state - only when closed and can interact
        !isOpen && canInteract && 'hover:bg-white',
        // Shadow only when focused
        'focus-within:shadow-[0px_4px_20px_0px_rgba(104,129,153,0.3)]',
      )}
    >
      {/* Button */}
      <button
        type="button"
        onClick={() => canInteract && onToggle()}
        disabled={!canInteract}
        className={cn(
          'flex h-[80px] w-full items-center justify-between px-[25px] py-[15px]',
          'transition-colors duration-200',
          isLoading && 'cursor-wait',
          error && 'cursor-not-allowed',
        )}
      >
        {/* Left: Label + Content */}
        <div className="flex items-center gap-[80px]">
          <span className="w-[120px] shrink-0 text-left text-base font-semibold leading-[19px] text-blue-1">
            {label}
          </span>

          {isLoading && !error && (
            <span className="text-base font-medium leading-[120%] text-blue-5">
              {loadingMessage}
            </span>
          )}

          {error && (
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
        <div className="ml-[200px] px-[25px] pb-6 pt-4">{children}</div>
      )}
    </div>
  )
}

export { SelectableField }
