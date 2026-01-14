import { AssetSelector, Typography } from '@/components'

export default function App() {
  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'linear-gradient(228.01deg, #F9F7F5 44.51%, #3D5E7F 228.11%)',
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
          <div className="hidden md:block">{/* Stepper will go here */}</div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            {/* Asset Selector */}
            <AssetSelector />
          </div>
        </div>
      </div>
    </div>
  )
}
