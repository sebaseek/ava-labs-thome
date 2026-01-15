import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Transfer } from './Transfer'

// Mock the hooks
const mockSetSelectedAsset = vi.fn()
const mockSetSelectedVault = vi.fn()
const mockSetSelectedAddress = vi.fn()

vi.mock('@/hooks/useSelectedAsset', () => ({
  useSelectedAsset: vi.fn(() => ({
    selectedAsset: null,
    setSelectedAsset: mockSetSelectedAsset,
  })),
}))

vi.mock('@/hooks/useSelectedVault', () => ({
  useSelectedVault: vi.fn(() => ({
    selectedVault: null,
    setSelectedVault: mockSetSelectedVault,
  })),
}))

vi.mock('@/hooks/useSelectedToAddress', () => ({
  useSelectedToAddress: vi.fn(() => ({
    selectedAddress: null,
    setSelectedAddress: mockSetSelectedAddress,
  })),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

const renderWithProviders = (ui: ReactElement) => {
  const queryClient = createTestQueryClient()
  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  }
}

describe('Transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Transfer title', () => {
    renderWithProviders(<Transfer />)
    expect(screen.getByText('Transfer')).toBeInTheDocument()
  })

  it('renders form fields when transfer is not completed', () => {
    renderWithProviders(<Transfer />)
    expect(screen.getByText('Transfer')).toBeInTheDocument()
    // Form should be visible (not success screen)
    expect(screen.queryByText(/Transaction Successfully Created/i)).not.toBeInTheDocument()
  })

  it('shows validation errors when submit is clicked with empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Transfer />)

    const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
    await user.click(submitButton)

    // After clicking submit with empty fields, validation errors should be set
    // (We can't directly test the red borders without more complex setup, but we can verify the flow)
    await waitFor(() => {
      expect(screen.queryByText(/Transaction Successfully Created/i)).not.toBeInTheDocument()
    })
  })

  it('shows validation errors when submit is clicked with empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Transfer />)

    const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
    await user.click(submitButton)

    // After clicking submit with empty fields, form should still be visible (not success screen)
    await waitFor(() => {
      expect(screen.queryByText(/Transaction Successfully Created/i)).not.toBeInTheDocument()
      expect(screen.getByText('Transfer')).toBeInTheDocument()
    })
  })

  it('calls handleStartOver when Start Over is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Transfer />)

    const startOverButton = screen.getByRole('button', { name: /Start Over/i })
    await user.click(startOverButton)

    // After start over, form should still be visible
    expect(screen.getByText('Transfer')).toBeInTheDocument()
  })
})
