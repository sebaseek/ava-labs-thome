import { useState } from 'react'
import { StartOverModal } from '@/components/StartOverModal'
import { Button } from '@/components/ui'

interface NavigationControlProps {
  onStartOver: () => void
  onSubmitTransfer: () => void
}

export const NavigationControl = ({ onStartOver, onSubmitTransfer }: NavigationControlProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-[15px]">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-[9px] border-0 bg-blue-5-transparency-30 px-[20px] py-[12px] font-sans text-[16px] font-semibold leading-[16px] text-blue-2 backdrop-blur-[15px] transition-colors hover:bg-blue-5-transparency-15 hover:text-blue-4 sm:w-auto"
        >
          Start Over
        </Button>
        <Button
          onClick={onSubmitTransfer}
          className="w-full rounded-[9px] border-0 bg-gold-highlight-3 px-[20px] py-[12px] font-sans text-[16px] font-semibold leading-[16px] text-gold-highlight-dark backdrop-blur-[15px] transition-colors hover:bg-gold-highlight-4 sm:w-auto"
        >
          Submit Transfer
        </Button>
      </div>
      <StartOverModal open={isModalOpen} onOpenChange={setIsModalOpen} onConfirm={onStartOver} />
    </>
  )
}
