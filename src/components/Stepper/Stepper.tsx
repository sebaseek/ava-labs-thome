import { cn } from '@/components/utils'

export type StepIndex = 0 | 1 | 2 | 3 | 4

interface StepperProps {
  activeStep: StepIndex | null
}

const STEP_COUNT = 5

export const Stepper = ({ activeStep }: StepperProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {Array.from({ length: STEP_COUNT }, (_, index) => {
        const stepIndex = index as StepIndex
        const isActive = activeStep === stepIndex

        return (
          <div
            key={stepIndex}
            className={cn(
              'w-[5px] rounded-full transition-all duration-200',
              isActive ? 'h-[40px] bg-blue-highlight-dark-1' : 'h-[5px] bg-blue-5-transparency-30',
            )}
          />
        )
      })}
    </div>
  )
}
