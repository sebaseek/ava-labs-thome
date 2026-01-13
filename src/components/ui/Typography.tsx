import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/components/utils'

const typographyVariants = cva('', {
  defaultVariants: {
    variant: 'body',
  },
  variants: {
    variant: {
      // Body / captions
      body: 'text-[16px] font-medium',
      caption: 'text-[14px] font-medium',
      // Headlines - base sizes
      h1: 'text-[48px] font-bold',
      h2: 'text-[40px] font-semibold',
      h3: 'text-[30px] font-semibold',
      h4: 'text-[25px] font-semibold',
      h5: 'text-[20px] font-semibold',
      h6: 'text-[16px] leading-[19px] font-semibold',
      h7: 'text-[14px] leading-[17px] font-medium',
      h8: 'text-[12px] font-medium',
    },
    weight: {
      bold: 'font-bold',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
  },
})

type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const isHeading = (variant: string): variant is Heading =>
  variant.startsWith('h') && parseInt(variant.slice(1), 10) <= 6

export type TypographyProps = React.ComponentProps<'p' | Heading> &
  VariantProps<typeof typographyVariants> & {
    as?: 'p' | Heading
  }

export const Typography = React.forwardRef<
  HTMLHeadingElement | HTMLParagraphElement,
  TypographyProps
>(({ as, className, variant, weight, ...props }, ref) => {
  // Determine the HTML element to use:
  // 1. Use explicit 'as' prop if provided
  // 2. Use the variant name if it's a heading (h1-h6)
  // 3. Default to 'p' for body text and non-semantic headings (h7, h8)
  const Component = as ?? (variant && isHeading(variant) ? variant : 'p')

  return (
    <Component
      ref={ref}
      className={cn(typographyVariants({ className, variant, weight }))}
      {...props}
    />
  )
})
Typography.displayName = 'Typography'
