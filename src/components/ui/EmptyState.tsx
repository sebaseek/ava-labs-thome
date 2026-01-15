import type { ReactNode } from 'react'

export interface EmptyStateProps {
  message: string
  children?: ReactNode
}

/**
 * EmptyState component for consistent empty state rendering
 */
export const EmptyState = ({ message, children }: EmptyStateProps) => {
  return (
    <div className="py-8 text-center">
      <span className="text-base font-medium text-blue-5">{message}</span>
      {children}
    </div>
  )
}
