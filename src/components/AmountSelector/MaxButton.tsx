import { useEffect, useRef, useState } from 'react'
import { cn } from '@/components/utils'

export interface MaxButtonProps {
  onClick: () => void
  isMaxAmount: boolean
}

/**
 * MaxButton component with tooltip for max amount feedback
 */
export const MaxButton = ({ onClick, isMaxAmount }: MaxButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const maxButtonRef = useRef<HTMLButtonElement>(null)
  const tooltipTimeoutRef = useRef<number | null>(null)

  // Reset tooltip when amount changes manually
  useEffect(() => {
    if (showTooltip && !isMaxAmount) {
      setShowTooltip(false)
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
        tooltipTimeoutRef.current = null
      }
    }
  }, [showTooltip, isMaxAmount])

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return

    const handleClickOutside = (event: MouseEvent) => {
      if (maxButtonRef.current && !maxButtonRef.current.contains(event.target as Node)) {
        setShowTooltip(false)
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current)
          tooltipTimeoutRef.current = null
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTooltip])

  const handleMaxClick = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }

    if (isMaxAmount) {
      setShowTooltip(true)
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false)
        tooltipTimeoutRef.current = null
      }, 3000)
      return
    }

    onClick()
    setShowTooltip(false)
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={maxButtonRef}
        type="button"
        onClick={handleMaxClick}
        className={cn(
          'h-[48px] shrink-0 rounded-[8px] px-3 sm:px-4',
          'bg-blue-5-transparency-30 backdrop-blur-[15px]',
          'text-xs sm:text-sm font-medium leading-[120%] text-blue-1',
          'transition-colors duration-200',
          'hover:bg-blue-5/40',
        )}
      >
        MAX
      </button>
      {showTooltip && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-2',
            'rounded-[9px] bg-white p-[15px]',
            'backdrop-blur-[40px]',
            'shadow-[0px_4px_20px_0px_rgba(104,129,153,0.3)]',
            'font-sans text-[14px] font-medium leading-[120%]',
            'text-blue-5',
            'whitespace-nowrap',
          )}
        >
          You've already entered the maximum amount available for the selected source.
        </div>
      )}
    </div>
  )
}
