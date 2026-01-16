import { Card, Skeleton } from '@/components/ui'

/**
 * Skeleton loader for the transfer form during submission
 * Shows placeholder content matching the form structure
 */
export function TransferFormSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Asset Selector Skeleton */}
      <Card hover={false}>
        <div className="flex h-[80px] w-full items-center justify-between px-4 py-[15px] sm:px-[25px]">
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-[80px]">
            <Skeleton className="h-5 w-[60px] shrink-0 sm:w-[120px]" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="h-5 w-5 shrink-0" />
        </div>
      </Card>

      {/* Vault Selector Skeleton */}
      <Card hover={false}>
        <div className="flex h-[80px] w-full items-center justify-between px-4 py-[15px] sm:px-[25px]">
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-[80px]">
            <Skeleton className="h-5 w-[60px] shrink-0 sm:w-[120px]" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-5 shrink-0" />
        </div>
      </Card>

      {/* To Vault Selector Skeleton */}
      <Card hover={false}>
        <div className="flex h-[80px] w-full items-center justify-between px-4 py-[15px] sm:px-[25px]">
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-[80px]">
            <Skeleton className="h-5 w-[60px] shrink-0 sm:w-[120px]" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 shrink-0" />
        </div>
      </Card>

      {/* Amount Selector Skeleton */}
      <Card hover={false}>
        <div className="flex h-auto w-full flex-col">
          <div className="px-4 py-[15px] sm:px-[25px]">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <Skeleton className="h-5 w-[60px] shrink-0 sm:w-[120px]" />
              <div className="flex flex-1 items-center gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
          <div className="px-4 py-[15px] sm:px-[25px]">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <div className="my-2 h-[1px] w-full bg-blue-5-transparency-30" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </Card>

      {/* Memo Skeleton */}
      <Card hover={false}>
        <div className="px-4 py-[15px] sm:px-[25px]">
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-[80px]">
            <Skeleton className="h-5 w-[60px] shrink-0 sm:w-[120px]" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </Card>

      {/* Navigation Control Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-[15px]">
        <Skeleton className="h-[44px] w-full rounded-[9px] sm:w-auto sm:min-w-[120px]" />
        <Skeleton className="h-[44px] w-full rounded-[9px] sm:w-auto sm:min-w-[140px]" />
      </div>
    </div>
  )
}
