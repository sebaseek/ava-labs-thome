import type { Asset } from '@/api/assets'
import { cn } from '@/components/utils'

export interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hasError?: boolean
  hasValue?: boolean
  selectedAsset: Asset | null
  onFocus?: () => void
  disabled?: boolean
}

/**
 * AmountInput component - handles amount input with asset symbol display
 */
export const AmountInput = ({
  value,
  onChange,
  placeholder = '0.00',
  hasError = false,
  selectedAsset,
  onFocus,
  disabled = false,
}: AmountInputProps) => {
  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'h-[48px] w-full rounded-[8px] border bg-white pl-4 pr-12 sm:pr-20 py-1',
          'font-sans text-base font-medium leading-[120%]',
          'transition-colors duration-200 outline-none',
          disabled && 'cursor-not-allowed opacity-50',
          hasError
            ? 'border-red-highlight-2 focus:border-red-highlight-2 focus:ring-2 focus:ring-red-highlight-2-transparency-40'
            : 'border-blue-5-transparency-30 focus:border-blue-5 focus:ring-2 focus:ring-blue-5/20',
          // Always show text-blue-1 when there's any value (even if being typed), otherwise use placeholder color
          value && value.trim() !== '' ? 'text-blue-1' : 'text-blue-5 placeholder:text-blue-5/70',
        )}
      />
      {selectedAsset && (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-3 sm:gap-1.5">
          <img
            src={selectedAsset.logoUri}
            alt={selectedAsset.symbol}
            className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]"
          />
          <span className="text-xs sm:text-sm font-medium text-blue-1">{selectedAsset.symbol}</span>
        </div>
      )}
    </div>
  )
}
