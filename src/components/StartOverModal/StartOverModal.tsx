import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'

interface StartOverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export const StartOverModal = ({ open, onOpenChange, onConfirm }: StartOverModalProps) => {
  const isMobile = useIsMobile()

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const content = (
    <>
      <div className="flex gap-[15px]">
        <Button
          onClick={() => onOpenChange(false)}
          className="flex-1 rounded-[9px] border-0 bg-blue-5-transparency-30 px-[40px] py-[12px] font-sans text-[16px] font-semibold leading-[16px] text-blue-2 transition-colors hover:bg-blue-5-transparency-15 hover:text-blue-4"
        >
          Go back
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 rounded-[9px] border-0 bg-gold-highlight-3 px-[40px] py-[12px] font-sans text-[16px] font-semibold leading-[16px] text-gold-highlight-dark transition-colors hover:bg-gold-highlight-4"
        >
          Yes, start over
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="border-0 bg-gray-soft-2 px-[24px] pb-[32px]">
          <div className="flex flex-col gap-[20px] pt-[20px]">
            <DrawerTitle className="text-center font-sans text-[28px] font-semibold leading-none text-blue-1">
              Start over?
            </DrawerTitle>
            <DrawerDescription className="text-center font-sans text-[14px] font-medium leading-[1.5] text-gray-1">
              This will erase everything you've entered so far. Are you sure you want to reset and
              start from scratch?
            </DrawerDescription>
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[620px] max-w-[90vw] gap-[25px] rounded-[20px] border-0 bg-gray-soft-2 px-[60px] py-[40px] shadow-[0px_4px_20px_0px_rgba(104,129,153,0.3)] backdrop-blur-[40px]"
      >
        <DialogTitle className="text-center font-sans text-[40px] font-semibold leading-none text-blue-1">
          Start over?
        </DialogTitle>
        <DialogDescription className="text-center font-sans text-[16px] font-medium leading-[1.5] text-gray-1">
          This will erase everything you've entered so far. Are you sure you want to reset and start
          from scratch?
        </DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  )
}
