import { useState } from 'react'
import { cn } from '@/components/utils'

export const Memo = () => {
  const [memo, setMemo] = useState('')

  return (
    <div
      className={cn(
        'w-full rounded-[12px] border border-card-border',
        'bg-white-transparency-40 backdrop-blur-[40px]',
        'overflow-hidden transition-all duration-200',
        'hover:bg-white',
      )}
    >
      <div className="flex h-auto w-full flex-col px-[25px] py-[15px]">
        <div className="flex h-[80px] items-center">
          <div className="flex w-full items-center gap-[80px]">
            <span className="w-[120px] shrink-0 text-base font-medium leading-[19px] text-blue-1">
              Memo
            </span>

            <div className="flex min-w-0 flex-1 items-center">
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Enter a memo"
                className={cn(
                  'h-[48px] w-full rounded-[8px] border bg-white pl-4 pr-4 py-1',
                  'font-sans text-base font-medium leading-[120%]',
                  'transition-colors duration-200 outline-none',
                  'border-blue-5-transparency-30 focus:border-blue-5 focus:ring-2 focus:ring-blue-5/20',
                  'placeholder:text-blue-5',
                  memo ? 'text-blue-1' : '',
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
