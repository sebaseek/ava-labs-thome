import { useForm } from '@tanstack/react-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TransferFormValues } from '@/schemas/transfer'
import { useFormReset } from './useFormReset'

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

describe('useFormReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides resetForm function', () => {
    const mockSetters = {
      setSelectedAsset: vi.fn(),
      setSelectedVault: vi.fn(),
      setSelectedAddress: vi.fn(),
      setTransferCompleted: vi.fn(),
      setHasAttemptedSubmit: vi.fn(),
    }

    const { result } = renderHook(
      () => {
        const form = useForm<TransferFormValues>({
          defaultValues: {
            asset: null,
            vault: null,
            toAddress: null,
            amount: '100.00',
            memo: 'test memo',
          },
        })

        return useFormReset({ form, setters: mockSetters })
      },
      { wrapper: createWrapper() },
    )

    expect(typeof result.current.resetForm).toBe('function')
  })

  it('resets form values when resetForm is called', () => {
    const mockSetters = {
      setSelectedAsset: vi.fn(),
      setSelectedVault: vi.fn(),
      setSelectedAddress: vi.fn(),
      setTransferCompleted: vi.fn(),
      setHasAttemptedSubmit: vi.fn(),
    }

    const { result } = renderHook(
      () => {
        const form = useForm<TransferFormValues>({
          defaultValues: {
            asset: null,
            vault: null,
            toAddress: null,
            amount: '100.00',
            memo: 'test memo',
          },
        })

        // Set some values first
        form.setFieldValue('amount', '200.00')
        form.setFieldValue('memo', 'updated memo')

        return useFormReset({ form, setters: mockSetters })
      },
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.resetForm()
    })

    // Form should be reset
    expect(mockSetters.setSelectedAsset).toHaveBeenCalledWith(null)
    expect(mockSetters.setSelectedVault).toHaveBeenCalledWith(null)
    expect(mockSetters.setSelectedAddress).toHaveBeenCalledWith(null)
    expect(mockSetters.setTransferCompleted).toHaveBeenCalledWith(false)
    expect(mockSetters.setHasAttemptedSubmit).toHaveBeenCalledWith(false)
  })
})
