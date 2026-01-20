import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AmountSelector } from './AmountSelector'

// Mock the hooks
const mockSelectedAsset = {
  id: '1',
  symbol: 'AVAX',
  name: 'Avax',
  decimals: 18,
  logoUri: '/avax.png',
  networkId: '1',
  coinGeckoId: 'avalanche-2',
}

const mockSelectedVault = { id: '1', name: 'Vault 1' }
vi.mock('@/hooks/useAmountCalculations', () => ({
  useAmountCalculations: vi.fn(() => ({
    fee: '100000000000000000',
    feeError: null,
    feeTokenSymbol: 'AVAX',
    isNativeToken: true, // AVAX is native token
    balanceError: null,
    availableBalance: {
      balance: BigInt('1000000000000000000'),
      usdValue: 20,
      formatted: '1',
    },
    formattedFee: '0.1',
    maxAmount: {
      bigInt: BigInt('900000000000000000'), // balance - fee for native tokens
      formatted: '0.9',
    },
    isMaxAmount: false,
  })),
}))

vi.mock('@/hooks/useBalanceDisplay', () => ({
  useBalanceDisplay: vi.fn(() => ({
    hasBalanceError: false,
    hasInputError: false,
    displayText: '$ 20.00 ≈ 1 AVAX',
  })),
}))

// Mock API calls (still needed for useAmountInput)
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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

const renderWithProviders = (ui: ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('AmountSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders amount input field', () => {
    renderWithProviders(
      <AmountSelector selectedAsset={mockSelectedAsset} selectedVault={mockSelectedVault} />,
    )
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })

  it('renders MAX button', () => {
    renderWithProviders(
      <AmountSelector selectedAsset={mockSelectedAsset} selectedVault={mockSelectedVault} />,
    )
    expect(screen.getByRole('button', { name: /MAX/i })).toBeInTheDocument()
  })

  it('calls setAmount when amount prop is provided', async () => {
    const setAmount = vi.fn()
    renderWithProviders(
      <AmountSelector
        selectedAsset={mockSelectedAsset}
        selectedVault={mockSelectedVault}
        amount="100"
        setAmount={setAmount}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
    })
  })

  it('shows error border on input when hasError is true', async () => {
    const { container } = renderWithProviders(
      <AmountSelector
        selectedAsset={mockSelectedAsset}
        selectedVault={mockSelectedVault}
        hasError
      />,
    )
    await waitFor(() => {
      const input = container.querySelector('input')
      expect(input).toHaveClass('border-red-highlight-2')
    })
  })

  it('calls onFieldClick when input is focused', async () => {
    const user = userEvent.setup()
    const handleFieldClick = vi.fn()
    renderWithProviders(
      <AmountSelector
        selectedAsset={mockSelectedAsset}
        selectedVault={mockSelectedVault}
        onFieldClick={handleFieldClick}
      />,
    )
    const input = screen.getByPlaceholderText('0.00')
    await user.click(input)
    expect(handleFieldClick).toHaveBeenCalledTimes(1)
  })

  it('calls setAmount when user types', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    renderWithProviders(
      <AmountSelector
        selectedAsset={mockSelectedAsset}
        selectedVault={mockSelectedVault}
        setAmount={setAmount}
      />,
    )
    const input = screen.getByPlaceholderText('0.00')
    await user.type(input, '100')
    expect(setAmount).toHaveBeenCalled()
  })

  it('handles max button click', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    renderWithProviders(
      <AmountSelector
        selectedAsset={mockSelectedAsset}
        selectedVault={mockSelectedVault}
        setAmount={setAmount}
      />,
    )

    await waitFor(() => {
      const maxButton = screen.getByRole('button', { name: /MAX/i })
      expect(maxButton).toBeInTheDocument()
    })

    const maxButton = screen.getByRole('button', { name: /MAX/i })
    await user.click(maxButton)

    // Max button should call setAmount with the max value
    await waitFor(() => {
      expect(setAmount).toHaveBeenCalled()
    })
  })
})
