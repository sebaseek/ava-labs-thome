import { useForm } from '@tanstack/react-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import { useFormStateSync } from './useFormStateSync'

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

describe('useFormStateSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('syncs selectedAsset to form when asset changes', () => {
    const { result, rerender } = renderHook(
      ({ selectedAsset }) => {
        const form = useForm({
          defaultValues: {
            asset: null,
            vault: null,
            toAddress: null,
            amount: '0.00',
            memo: '',
          },
        })

        useFormStateSync({
          form: form as any,
          selectedAsset,
          selectedVault: null,
          selectedAddress: null,
        })

        return form
      },
      {
        wrapper: createWrapper(),
        initialProps: { selectedAsset: null as any },
      },
    )

    // Update selectedAsset
    rerender({ selectedAsset: mockAsset as any })

    // Form should have synced the asset
    expect(result.current.state.values.asset).toBe(mockAsset)
  })

  it('syncs selectedVault to form when vault changes', () => {
    const { result, rerender } = renderHook(
      ({ selectedVault }) => {
        const form = useForm({
          defaultValues: {
            asset: null,
            vault: null,
            toAddress: null,
            amount: '0.00',
            memo: '',
          },
        })

        useFormStateSync({
          form: form as any,
          selectedAsset: null,
          selectedVault,
          selectedAddress: null,
        })

        return form
      },
      {
        wrapper: createWrapper(),
        initialProps: { selectedVault: null as any },
      },
    )

    // Update selectedVault
    rerender({ selectedVault: mockVault as any })

    // Form should have synced the vault
    expect(result.current.state.values.vault).toBe(mockVault)
  })

  it('syncs selectedAddress to form when address changes', () => {
    const { result, rerender } = renderHook(
      ({ selectedAddress }) => {
        const form = useForm({
          defaultValues: {
            asset: null,
            vault: null,
            toAddress: null,
            amount: '0.00',
            memo: '',
          },
        })

        useFormStateSync({
          form: form as any,
          selectedAsset: null,
          selectedVault: null,
          selectedAddress,
        })

        return form
      },
      {
        wrapper: createWrapper(),
        initialProps: { selectedAddress: null as any },
      },
    )

    // Update selectedAddress
    rerender({ selectedAddress: mockAddress as any })

    // Form should have synced the address
    expect(result.current.state.values.toAddress).toBe(mockAddress)
  })
})
