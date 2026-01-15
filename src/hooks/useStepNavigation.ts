import { useCallback, useState } from 'react'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import type { StepIndex } from '@/components'

interface UseStepNavigationOptions {
  selectedAsset: Asset | null
  selectedVault: Vault | null
}

interface UseStepNavigationReturn {
  activeStep: StepIndex | null
  setActiveStep: (step: StepIndex | null) => void
  isStepDisabled: (step: StepIndex) => boolean
  handleStepClick: (step: StepIndex) => void
}

/**
 * Hook for managing step navigation in the transfer form
 * Handles step enabling/disabling logic and step click handling
 */
export const useStepNavigation = ({
  selectedAsset,
  selectedVault,
}: UseStepNavigationOptions): UseStepNavigationReturn => {
  const [activeStep, setActiveStep] = useState<StepIndex | null>(null)

  // Check if a step is disabled
  const isStepDisabled = useCallback(
    (step: StepIndex): boolean => {
      // Use hook state for asset/vault since components update hooks directly
      if (step === 0 || step === 4) return false // Asset and Memo are never disabled
      if (step === 1 || step === 2) return !selectedAsset // Vault and To require asset
      if (step === 3) return !selectedAsset || !selectedVault // Amount requires asset and vault
      return false
    },
    [selectedAsset, selectedVault],
  )

  // Handle step click/focus - only set if not disabled
  const handleStepClick = useCallback(
    (step: StepIndex) => {
      if (!isStepDisabled(step)) {
        setActiveStep(step)
      }
    },
    [isStepDisabled],
  )

  return {
    activeStep,
    setActiveStep,
    isStepDisabled,
    handleStepClick,
  }
}
