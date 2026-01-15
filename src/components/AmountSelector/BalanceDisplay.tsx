import { cn } from '@/components/utils'

export interface BalanceDisplayProps {
  availableBalanceDisplay: string
  hasError: boolean
}

/**
 * BalanceDisplay component - shows available balance or error message
 */
export const BalanceDisplay = ({ availableBalanceDisplay, hasError }: BalanceDisplayProps) => {
  return (
    <div className="flex items-center">
      <div className="ml-0 flex items-center gap-[15px] sm:ml-[200px]">
        {!hasError && (
          <span className="text-xs font-medium leading-[100%] text-gray-1 font-sans">
            Available
          </span>
        )}
        <span
          className={cn(
            'text-xs font-medium leading-[100%] font-sans',
            hasError ? 'text-red-highlight-2' : 'text-gray-1',
          )}
        >
          {availableBalanceDisplay}
        </span>
      </div>
    </div>
  )
}
