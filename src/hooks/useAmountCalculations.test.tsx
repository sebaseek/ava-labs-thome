import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import { useAmountCalculations } from './useAmountCalculations'

const mockAsset: Asset = {
  id: 'asset-1',
  symbol: 'AVAX',
  name: 'Avax',
  decimals: 18,
  logoUri: '/avax.png',
  networkId: 'network-1',
  coinGeckoId: 'avalanche-2',
}

const mockVault: Vault = {
  id: 'vault-1',
  name: 'Vault 1',
}

vi.mock('@/api/fee', () => ({
  fetchFee: vi.fn(() => Promise.resolve('100000000000000000')), // 0.1 AVAX
}))

vi.mock('@/api/vault-balances', () => ({
  fetchBalancesForVault: vi.fn(() =>
    Promise.resolve([
      { balance: '1000000000000000000', accountIndex: 0 }, // 1 AVAX
    ]),
  ),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAmountCalculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null values when no asset or vault selected', () => {
    const { result } = renderHook(
      () =>
        useAmountCalculations({
          selectedAsset: null,
          selectedVault: null,
          currentAmount: '0.00',
        }),
      { wrapper: createWrapper() },
    )

    expect(result.current.fee).toBe(null)
    expect(result.current.availableBalance.balance).toBe(BigInt(0))
    expect(result.current.availableBalance.formatted).toBe('0')
  })

  it('fetches fee when asset is selected', async () => {
    const { result } = renderHook(
      () =>
        useAmountCalculations({
          selectedAsset: mockAsset,
          selectedVault: mockVault,
          currentAmount: '0.00',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.fee).not.toBe(null)
    })

    expect(result.current.fee).toBe('100000000000000000')
  })

  it('calculates available balance correctly', async () => {
    const { result } = renderHook(
      () =>
        useAmountCalculations({
          selectedAsset: mockAsset,
          selectedVault: mockVault,
          currentAmount: '0.00',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.availableBalance.balance).toBeGreaterThan(BigInt(0))
    })

    expect(result.current.availableBalance.formatted).toBe('1')
    // USD value depends on ASSET_PRICES, which may be 0 if coinGeckoId not in prices
    // Just verify the calculation structure works
    expect(typeof result.current.availableBalance.usdValue).toBe('number')
  })

  it('calculates max amount correctly (balance minus fee)', async () => {
    const { result } = renderHook(
      () =>
        useAmountCalculations({
          selectedAsset: mockAsset,
          selectedVault: mockVault,
          currentAmount: '0.00',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.maxAmount.bigInt).toBeGreaterThan(BigInt(0))
    })

    // Max should be balance (1 AVAX) minus fee (0.1 AVAX) = 0.9 AVAX
    expect(result.current.maxAmount.formatted).toBe('0.9')
  })

  it('formats fee correctly', async () => {
    const { result } = renderHook(
      () =>
        useAmountCalculations({
          selectedAsset: mockAsset,
          selectedVault: mockVault,
          currentAmount: '0.00',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.formattedFee).not.toBe('')
    })

    expect(result.current.formattedFee).toBe('0.1')
  })

  it('detects when current amount equals max amount', async () => {
    const { result } = renderHook(
      () =>
        useAmountCalculations({
          selectedAsset: mockAsset,
          selectedVault: mockVault,
          currentAmount: '0.9', // Max amount
          setAmount: vi.fn(),
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.maxAmount.formatted).toBe('0.9')
    })

    // Should detect that current amount equals max
    expect(result.current.isMaxAmount).toBe(true)
  })

  it('resets amount when asset changes', async () => {
    const setAmount = vi.fn()
    const { rerender } = renderHook(
      ({ asset }) =>
        useAmountCalculations({
          selectedAsset: asset,
          selectedVault: mockVault,
          currentAmount: '100.00',
          setAmount,
        }),
      {
        wrapper: createWrapper(),
        initialProps: { asset: mockAsset },
      },
    )

    await waitFor(() => {
      expect(setAmount).not.toHaveBeenCalled()
    })

    // Change asset
    const newAsset = { ...mockAsset, id: 'asset-2' }
    rerender({ asset: newAsset })

    await waitFor(() => {
      expect(setAmount).toHaveBeenCalledWith('0.00')
    })
  })
})
