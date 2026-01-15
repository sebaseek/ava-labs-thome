import { useState } from 'react'
import {
  AmountSelector,
  AssetSelector,
  Memo,
  NavigationControl,
  type StepIndex,
  Stepper,
  ToVaultSelector,
  Typography,
  VaultSelector,
} from '@/components'
import { useSelectedAsset } from '@/hooks/useSelectedAsset'
import { useSelectedToAddress } from '@/hooks/useSelectedToAddress'
import { useSelectedVault } from '@/hooks/useSelectedVault'

export const Transfer = () => {
  const { selectedAsset, setSelectedAsset } = useSelectedAsset()
  const { selectedVault, setSelectedVault } = useSelectedVault()
  const { setSelectedAddress } = useSelectedToAddress()
  const [memo, setMemo] = useState('')
  const [activeStep, setActiveStep] = useState<StepIndex | null>(null)

  // Check if a step is disabled
  const isStepDisabled = (step: StepIndex): boolean => {
    if (step === 0 || step === 4) return false // Asset and Memo are never disabled
    if (step === 1 || step === 2) return !selectedAsset // Vault and To require asset
    if (step === 3) return !selectedAsset || !selectedVault // Amount requires asset and vault
    return false
  }

  // Handle step click/focus - only set if not disabled
  const handleStepClick = (step: StepIndex) => {
    if (!isStepDisabled(step)) {
      setActiveStep(step)
    }
  }

  const handleStartOver = () => {
    setSelectedAsset(null)
    setSelectedVault(null)
    setSelectedAddress(null)
    setMemo('')
    setActiveStep(null)
  }

  const handleSubmitTransfer = () => {
    // TODO: Implement submit transfer functionality
    console.log('Submit Transfer clicked')
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'var(--color-gradient-background)',
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Title - Full Width Row */}
        <Typography variant="h3" className="mb-6 text-blue-1 md:mb-8">
          Transfer
        </Typography>

        {/* Grid Layout - Stepper + Form (responsive: stacks on mobile) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr] md:gap-12">
          {/* Left Column - Stepper (hidden on mobile) */}
          <div className="hidden md:block">
            <Stepper activeStep={activeStep} />
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            {/* Asset Selector */}
            <AssetSelector onFieldClick={() => handleStepClick(0)} />
            {/* Vault Selector */}
            <VaultSelector onFieldClick={() => handleStepClick(1)} />
            {/* To Vault Selector */}
            <ToVaultSelector onFieldClick={() => handleStepClick(2)} />
            {/* Amount Selector */}
            <AmountSelector onFieldClick={() => handleStepClick(3)} />
            {/* Memo */}
            <Memo value={memo} onChange={setMemo} onFieldClick={() => handleStepClick(4)} />
            {/* Navigation Control */}
            <NavigationControl
              onStartOver={handleStartOver}
              onSubmitTransfer={handleSubmitTransfer}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
