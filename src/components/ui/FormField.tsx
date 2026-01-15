import type { ReactNode } from 'react'
import { cn } from '../utils'

export interface FormFieldProps {
  label: string
  children: ReactNode
  className?: string
  labelWidth?: string
  gap?: string
}

/**
 * FormField wrapper component for consistent form field styling
 * Provides consistent layout for label + content pattern
 */
export const FormField = ({
  label,
  children,
  className,
  labelWidth = 'w-[120px]',
  gap = 'gap-[80px]',
}: FormFieldProps) => {
  return (
    <div className={cn('flex h-auto w-full flex-col px-4 sm:px-[25px]', className)}>
      <div className="flex h-[80px] items-center">
        <div className="flex w-full items-center gap-1 sm:gap-[80px]">
          <span
            className={cn(
              'w-[60px] shrink-0 text-left text-base font-semibold leading-[19px] text-blue-1',
              labelWidth === 'w-[120px]' ? 'sm:w-[120px]' : `sm:${labelWidth}`,
            )}
          >
            {label}
          </span>
          <div className="flex min-w-0 flex-1 items-center">{children}</div>
        </div>
      </div>
    </div>
  )
}
