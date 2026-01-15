import { Card, FormField } from '@/components/ui'
import { cn } from '@/components/utils'

interface MemoProps {
  value: string
  onChange: (value: string) => void
}

export const Memo = ({ value, onChange }: MemoProps) => {
  return (
    <Card>
      <FormField label="Memo">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter a memo"
          className={cn(
            'h-[48px] w-full rounded-[8px] border bg-white pl-4 pr-4 py-1',
            'font-sans text-base font-medium leading-[120%]',
            'transition-colors duration-200 outline-none',
            'border-blue-5-transparency-30 focus:border-blue-5 focus:ring-2 focus:ring-blue-5/20',
            'placeholder:text-blue-5',
            value ? 'text-blue-1' : '',
          )}
        />
      </FormField>
    </Card>
  )
}
