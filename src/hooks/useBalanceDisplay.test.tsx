import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Asset } from '@/api/assets'
import { useBalanceDisplay } from './useBalanceDisplay'

const mockAsset: Asset = {
  id: 'asset-1',
  symbol: 'AVAX',
  name: 'Avax',
  decimals: 18,
  logoUri: '/avax.png',
  networkId: 'network-1',
  coinGeckoId: 'avalanche-2',
}

describe('useBalanceDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error message when balance error exists', () => {
    const mockError = new Error('Failed to fetch balance')
    const { result } = renderHook(() =>
      useBalanceDisplay({
        balanceError: mockError,
        insufficientBalance: null,
        totalNeeded: null,
        availableBalance: {
          balance: BigInt(0),
          usdValue: 0,
          formatted: '0',
        },
        selectedAsset: mockAsset,
      }),
    )

    expect(result.current.hasBalanceError).toBe(true)
    expect(result.current.hasInputError).toBe(true)
    expect(result.current.displayText).toBe('Unable to load usable balance')
  })

  it('shows insufficient balance message when balance is insufficient', () => {
    const { result } = renderHook(() =>
      useBalanceDisplay({
        balanceError: null,
        insufficientBalance: '0.5',
        totalNeeded: '1.5',
        availableBalance: {
          balance: BigInt(500000000000000000),
          usdValue: 10,
          formatted: '0.5',
        },
        selectedAsset: mockAsset,
      }),
    )

    expect(result.current.hasInputError).toBe(true)
    expect(result.current.displayText).toContain('Insufficient balance')
    expect(result.current.displayText).toContain('Total needed:')
    expect(result.current.displayText).toContain('1.5')
    expect(result.current.displayText).toContain('AVAX')
  })

  it('shows placeholder when no asset or zero balance', () => {
    const { result } = renderHook(() =>
      useBalanceDisplay({
        balanceError: null,
        insufficientBalance: null,
        totalNeeded: null,
        availableBalance: {
          balance: BigInt(0),
          usdValue: 0,
          formatted: '0',
        },
        selectedAsset: null,
      }),
    )

    expect(result.current.displayText).toBe('--')
  })

  it('formats balance display correctly with USD value', () => {
    const { result } = renderHook(() =>
      useBalanceDisplay({
        balanceError: null,
        insufficientBalance: null,
        totalNeeded: null,
        availableBalance: {
          balance: BigInt(1000000000000000000),
          usdValue: 20.5,
          formatted: '1',
        },
        selectedAsset: mockAsset,
      }),
    )

    expect(result.current.hasInputError).toBe(false)
    expect(result.current.displayText).toContain('$')
    expect(result.current.displayText).toContain('20.50')
    expect(result.current.displayText).toContain('1')
    expect(result.current.displayText).toContain('AVAX')
  })

  it('handles zero balance correctly', () => {
    const { result } = renderHook(() =>
      useBalanceDisplay({
        balanceError: null,
        insufficientBalance: null,
        totalNeeded: null,
        availableBalance: {
          balance: BigInt(0),
          usdValue: 0,
          formatted: '0',
        },
        selectedAsset: mockAsset,
      }),
    )

    expect(result.current.displayText).toBe('--')
  })
})
