import { Info } from 'lucide-react'

export interface FeeDisplayProps {
  formattedFee: string | null
  feeTokenSymbol: string | null // Native token symbol (AVAX, ETH, BTC)
  feeError: boolean | Error | null
}

/**
 * FeeDisplay component - shows fee information in native network token
 */
export const FeeDisplay = ({ formattedFee, feeTokenSymbol, feeError }: FeeDisplayProps) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-[80px]">
        <div className="flex w-[120px] shrink-0 items-center gap-2">
          <span className="text-base font-semibold leading-[19px] text-blue-1">Fee</span>
          <Info className="h-2.5 w-2.5 text-blue-5" />
        </div>

        {feeTokenSymbol && formattedFee !== null && !feeError ? (
          <span className="text-base font-medium leading-[120%] text-blue-5">
            {formattedFee} {feeTokenSymbol}
          </span>
        ) : feeTokenSymbol && feeError ? (
          <span className="text-base font-medium leading-[120%] text-red-highlight-2">
            Unable to load fee
          </span>
        ) : (
          <span className="text-base font-medium leading-[120%] text-blue-5">--</span>
        )}
      </div>
    </div>
  )
}
