import { Typography } from '@/components/ui/Typography'

interface TransferSuccessProps {
  onViewTransaction?: () => void
  onNewRequest?: () => void
}

export const TransferSuccess = ({ onViewTransaction, onNewRequest }: TransferSuccessProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Ellipsis Image */}
      <img src="/images/Ellipsis.png" alt="Success" className="mb-5" />

      {/* Success Title */}
      <Typography variant="h2" className="mb-5 text-center text-blue-1">
        Transaction
        <br />
        Successfully Created!
      </Typography>

      {/* Description */}
      <p className="mb-5 text-center font-sans text-[16px] font-medium text-gray-1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque et pharetra lectus, ut
        rhoncus velit.
      </p>

      {/* Buttons Container */}
      <div className="flex gap-[15px]">
        <button
          type="button"
          onClick={onViewTransaction}
          className="h-[45px] rounded-[9px] bg-blue-5-transparency-30 px-[20px] font-sans text-[16px] font-semibold text-blue-2 transition-colors"
        >
          View Transaction
        </button>
        <button
          type="button"
          onClick={onNewRequest}
          className="h-[45px] rounded-[9px] bg-gold-highlight-3 px-[20px] font-sans text-[16px] font-semibold text-gold-highlight-dark transition-colors"
        >
          New Request
        </button>
      </div>
    </div>
  )
}
