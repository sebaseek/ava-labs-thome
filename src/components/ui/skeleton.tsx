import { cn } from '../utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-blue-5-transparency-15', className)}
      {...props}
    />
  )
}

export { Skeleton }
