import { useForm } from '@tanstack/react-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import type { TransferFormInputValues } from '@/schemas/transfer'
import { useTransferFormValidation } from './useTransferFormValidation'

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

const mockAddress: Address = {
  address: '0x123',
  name: 'Test Address',
  isExternal: false,
  isVault: false,
}

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

describe('useTransferFormValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns no errors when form is valid and submit not attempted', () => {
    const { result } = renderHook(
      () => {
        const form = useForm({
          defaultValues: {
            asset: mockAsset,
            vault: mockVault,
            toAddress: mockAddress,
            amount: '100.00',
            memo: '',
          } as TransferFormInputValues,
        })
        return useTransferFormValidation({
          form,
          hasAttemptedSubmit: false,
          touchedFields: new Set(),
        })
      },
      { wrapper: createWrapper() },
    )

    expect(result.current.assetError).toBe(false)
    expect(result.current.vaultError).toBe(false)
    expect(result.current.toAddressError).toBe(false)
    expect(result.current.amountError).toBe(false)
    expect(Object.keys(result.current.fieldErrors)).toHaveLength(0)
  })

  it('returns errors when submit attempted and form is invalid', () => {
    const { result } = renderHook(
      () => {
        const form = useForm({
          defaultValues: {
            asset: null,
            vault: null,
            toAddress: null,
            amount: '0.00',
            memo: '',
          } as TransferFormInputValues,
        })
        return useTransferFormValidation({
          form,
          hasAttemptedSubmit: true,
          touchedFields: new Set(),
        })
      },
      { wrapper: createWrapper() },
    )

    expect(result.current.assetError).toBe(true)
    expect(result.current.vaultError).toBe(true)
    expect(result.current.toAddressError).toBe(true)
    expect(result.current.amountError).toBe(true)
    expect(Object.keys(result.current.fieldErrors).length).toBeGreaterThan(0)
  })

  it('validates amount correctly', () => {
    const { result } = renderHook(
      () => {
        const form = useForm({
          defaultValues: {
            asset: mockAsset,
            vault: mockVault,
            toAddress: mockAddress,
            amount: '0.00',
            memo: '',
          } as TransferFormInputValues,
        })
        return useTransferFormValidation({
          form,
          hasAttemptedSubmit: true,
          touchedFields: new Set(),
        })
      },
      { wrapper: createWrapper() },
    )

    expect(result.current.amountError).toBe(true)
    expect(result.current.fieldErrors.amount).toBeDefined()
  })

  it('validates asset correctly', () => {
    const { result } = renderHook(
      () => {
        const form = useForm({
          defaultValues: {
            asset: null,
            vault: mockVault,
            toAddress: mockAddress,
            amount: '100.00',
            memo: '',
          } as TransferFormInputValues,
        })
        return useTransferFormValidation({
          form,
          hasAttemptedSubmit: true,
          touchedFields: new Set(),
        })
      },
      { wrapper: createWrapper() },
    )

    expect(result.current.assetError).toBe(true)
    expect(result.current.fieldErrors.asset).toBeDefined()
  })

  it('provides validateForm function', () => {
    const { result } = renderHook(
      () => {
        const form = useForm({
          defaultValues: {
            asset: mockAsset,
            vault: mockVault,
            toAddress: mockAddress,
            amount: '100.00',
            memo: 'Test memo',
          } as TransferFormInputValues,
        })
        return useTransferFormValidation({
          form,
          hasAttemptedSubmit: false,
          touchedFields: new Set(),
        })
      },
      { wrapper: createWrapper() },
    )

    expect(typeof result.current.validateForm).toBe('function')
    const validationResult = result.current.validateForm()
    expect(validationResult.success).toBe(true)
  })
})
