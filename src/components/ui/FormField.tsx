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
    <div className={cn('flex h-auto w-full flex-col px-[25px]', className)}>
      <div className="flex h-[80px] items-center">
        <div className={cn('flex w-full items-center', gap)}>
          <span
            className={cn(
              labelWidth,
              'shrink-0 text-left text-base font-semibold leading-[19px] text-blue-1',
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
