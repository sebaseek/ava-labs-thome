import type * as React from 'react'

import { cn } from '@/components/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-[8px] border border-blue-5-transparency-30',
        'bg-white-transparency-40 px-3 py-1',
        'text-base font-medium leading-[120%] text-blue-1',
        'placeholder:text-gray-1',
        'transition-colors duration-200',
        'outline-none',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-blue-5 focus:ring-2 focus:ring-blue-5/20',
        'aria-invalid:border-red-highlight-1 aria-invalid:ring-red-highlight-2-transparency-40',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
