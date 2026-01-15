import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import { useStepNavigation } from './useStepNavigation'

const mockAsset: Asset = {
  id: 'asset-1',
  symbol: 'VET',
  name: 'VeChain',
  decimals: 18,
  logoUri: '/vet.png',
  networkId: 'network-1',
  coinGeckoId: 'vechain',
  price: '0.02',
}

const mockVault: Vault = {
  id: 'vault-1',
  name: 'Vault 1',
}

describe('useStepNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with null activeStep', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: null,
        selectedVault: null,
      }),
    )

    expect(result.current.activeStep).toBe(null)
  })

  it('allows setting activeStep', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: mockAsset,
        selectedVault: mockVault,
      }),
    )

    act(() => {
      result.current.setActiveStep(0)
    })

    expect(result.current.activeStep).toBe(0)
  })

  it('disables step 1 and 2 when no asset selected', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: null,
        selectedVault: null,
      }),
    )

    expect(result.current.isStepDisabled(0)).toBe(false) // Asset step always enabled
    expect(result.current.isStepDisabled(1)).toBe(true) // Vault requires asset
    expect(result.current.isStepDisabled(2)).toBe(true) // To requires asset
    expect(result.current.isStepDisabled(3)).toBe(true) // Amount requires asset and vault
    expect(result.current.isStepDisabled(4)).toBe(false) // Memo always enabled
  })

  it('disables step 3 when no vault selected', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: mockAsset,
        selectedVault: null,
      }),
    )

    expect(result.current.isStepDisabled(0)).toBe(false)
    expect(result.current.isStepDisabled(1)).toBe(false) // Vault enabled with asset
    expect(result.current.isStepDisabled(2)).toBe(false) // To enabled with asset
    expect(result.current.isStepDisabled(3)).toBe(true) // Amount requires vault
    expect(result.current.isStepDisabled(4)).toBe(false)
  })

  it('enables all steps when asset and vault are selected', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: mockAsset,
        selectedVault: mockVault,
      }),
    )

    expect(result.current.isStepDisabled(0)).toBe(false)
    expect(result.current.isStepDisabled(1)).toBe(false)
    expect(result.current.isStepDisabled(2)).toBe(false)
    expect(result.current.isStepDisabled(3)).toBe(false)
    expect(result.current.isStepDisabled(4)).toBe(false)
  })

  it('handles step click for enabled step', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: mockAsset,
        selectedVault: mockVault,
      }),
    )

    act(() => {
      result.current.handleStepClick(3)
    })

    expect(result.current.activeStep).toBe(3)
  })

  it('does not set activeStep when step is disabled', () => {
    const { result } = renderHook(() =>
      useStepNavigation({
        selectedAsset: null,
        selectedVault: null,
      }),
    )

    act(() => {
      result.current.handleStepClick(3) // Should be disabled
    })

    expect(result.current.activeStep).toBe(null)
  })
})
