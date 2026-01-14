import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../utils'

export const selectableItemVariants = cva(
  'flex w-full items-center justify-between rounded-[8px] border p-3 transition-colors duration-200',
  {
    defaultVariants: {
      variant: 'default',
      selected: false,
    },
    variants: {
      variant: {
        default: 'border-transparent bg-white-transparency-40 hover:border-card-border hover:bg-white',
      },
      selected: {
        true: 'border-card-border bg-white',
        false: '',
      },
    },
  },
)

export type SelectableItemProps = ComponentProps<'button'> &
  VariantProps<typeof selectableItemVariants> & {
    selected?: boolean
  }

const SelectableItem = ({ className, selected, variant, ...props }: SelectableItemProps) => {
  return (
    <button
      type="button"
      data-slot="selectable-item"
      className={cn(selectableItemVariants({ variant, selected }), className)}
      {...props}
    />
  )
}

export { SelectableItem }
