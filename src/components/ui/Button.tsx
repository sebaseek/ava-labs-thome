import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[9px] px-[20px] py-[12px] leading-[16px] font-semibold transition-all duration-200',
  {
    defaultVariants: {
      variant: 'primary',
    },
    variants: {
      variant: {
        primary:
          'bg-gold-highlight-3 text-gold-highlight-dark hover:bg-gold-highlight-4 hover:text-gold-highlight-dark-2 disabled:bg-gold-highlight-2-transparency-40 disabled:text-gold-highlight-disabled',
        secondary:
          'bg-blue-5-transparency-30 text-blue-2 hover:bg-blue-5-transparency-15 hover:text-blue-4 disabled:bg-gray-5-transparency-50 disabled:text-gray-1',
        tertiary: 'rounded-[12px] border border-card-border bg-card leading-[19px] hover:bg-white',
        success:
          'bg-green-highlight-2-transparency-40 text-green-highlight-dark-1 hover:bg-green-highlight-dark-2 hover:text-green-highlight-4 disabled:bg-green-highlight-2-transparency-40 disabled:text-green-highlight-2',
        destructive:
          'bg-red-highlight-2-transparency-40 text-red-highlight-1 hover:bg-red-highlight-1 hover:text-red-highlight-4 disabled:bg-red-highlight-2-transparency-40 disabled:text-red-highlight-2',
      },
    },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({ asChild = false, className, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant }), className)} {...props} />
  )
}
