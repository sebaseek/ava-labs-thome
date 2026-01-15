import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAmountInput } from './useAmountInput'

const mockAsset = {
  id: '1',
  symbol: 'AVAX',
  name: 'Avax',
  decimals: 18,
  logoUri: '/logo.png',
  networkId: '1',
  coinGeckoId: 'avalanche-2',
}

describe('useAmountInput', () => {
  it('initializes with default amount', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )
    expect(result.current.amount).toBe('0.00')
  })

  it('uses external amount when provided', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
        amount: '100.50',
        setAmount: () => {},
      }),
    )
    expect(result.current.amount).toBe('100.50')
  })

  it('cleans input by removing non-numeric characters', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )

    act(() => {
      result.current.handleAmountChange('abc123.45def')
    })

    expect(result.current.amount).toBe('123.45')
  })

  it('removes leading zeros', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )

    act(() => {
      result.current.handleAmountChange('00123.45')
    })

    expect(result.current.amount).toBe('123.45')
  })

  it('preserves leading zero for decimals', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )

    act(() => {
      result.current.handleAmountChange('0.5')
    })

    expect(result.current.amount).toBe('0.5')
  })

  it('formats display amount with commas', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )

    act(() => {
      result.current.handleAmountChange('1000.50')
    })

    expect(result.current.displayAmount).toBe('1,000.5')
  })

  it('preserves trailing decimal point while typing', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )

    act(() => {
      result.current.handleAmountChange('100.')
    })

    expect(result.current.displayAmount).toBe('100.')
  })

  it('detects when amount has value', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
      }),
    )

    expect(result.current.hasValue).toBe(false)

    act(() => {
      result.current.handleAmountChange('100')
    })

    expect(result.current.hasValue).toBe(true)
  })

  it('calculates insufficient balance when amount exceeds available balance', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: '100000000000000000', // 0.1 AVAX
        availableBalance: BigInt(1000000000000000000), // 1 AVAX
      }),
    )

    act(() => {
      result.current.handleAmountChange('1.5') // 1.5 AVAX + 0.1 fee = 1.6 AVAX needed, but only 1 AVAX available
    })

    expect(result.current.insufficientBalance).not.toBeNull()
  })

  it('returns null for insufficient balance when amount is valid', () => {
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: '100000000000000000', // 0.1 AVAX
        availableBalance: BigInt(2000000000000000000), // 2 AVAX
      }),
    )

    act(() => {
      result.current.handleAmountChange('1.5') // 1.5 AVAX + 0.1 fee = 1.6 AVAX needed, 2 AVAX available
    })

    expect(result.current.insufficientBalance).toBeNull()
  })

  it('calls external setAmount when provided', () => {
    const setAmount = vi.fn()
    const { result } = renderHook(() =>
      useAmountInput({
        selectedAsset: mockAsset,
        fee: null,
        availableBalance: BigInt(1000000000000000000),
        setAmount,
      }),
    )

    act(() => {
      result.current.handleAmountChange('100')
    })

    expect(setAmount).toHaveBeenCalledWith('100')
  })
})
