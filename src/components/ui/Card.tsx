import type { ReactNode } from 'react'
import { cn } from '../utils'

export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

/**
 * Card component with consistent styling
 * Extracted from duplicated card container patterns across components
 */
export const Card = ({ children, className, hover = true }: CardProps) => {
  return (
    <div
      className={cn(
        'w-full rounded-[12px] border border-card-border',
        'bg-white-transparency-40 backdrop-blur-[40px]',
        'overflow-hidden transition-all duration-200',
        hover && 'hover:bg-white',
        className,
      )}
    >
      {children}
    </div>
  )
}
