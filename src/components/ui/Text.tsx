import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/components/utils'

const textVariants = cva('', {
  defaultVariants: {
    size: 'base',
    weight: 'medium',
    color: 'blue-1',
  },
  variants: {
    size: {
      base: 'text-base',
      sm: 'text-sm',
    },
    weight: {
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    color: {
      'blue-1': 'text-blue-1',
      'blue-5': 'text-blue-5',
      white: 'text-white',
      'gray-1': 'text-gray-1',
    },
    leading: {
      none: '',
      tight: 'leading-[19px]',
      normal: 'leading-[120%]',
      relaxed: 'leading-[17px]',
    },
  },
})

export type TextProps = React.ComponentProps<'span'> &
  VariantProps<typeof textVariants> & {
    as?: 'span' | 'p' | 'div'
    /**
     * When true, applies active color (blue-1), otherwise applies inactive color (blue-5)
     * Useful for placeholder text that changes based on focus/selection state
     */
    active?: boolean
  }

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ as = 'span', className, size, weight, color, leading, active, ...props }, ref) => {
    // Determine color based on active state if provided
    const resolvedColor = active !== undefined ? (active ? 'blue-1' : 'blue-5') : color

    return React.createElement(as, {
      ref,
      className: cn(textVariants({ size, weight, color: resolvedColor, leading }), className),
      ...props,
    })
  },
)
Text.displayName = 'Text'
