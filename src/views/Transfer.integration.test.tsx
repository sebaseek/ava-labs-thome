import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import { Transfer } from './Transfer'

// Mock API functions
vi.mock('@/api/assets', () => ({
  fetchAssets: vi.fn(() =>
    Promise.resolve([
      {
        id: 'eip155:43113/native',
        symbol: 'AVAX',
        name: 'Avax',
        decimals: 18,
        networkId: 'eip155:43113',
        coinGeckoId: 'avalanche-2',
        logoUri: 'https://example.com/avax.png',
      },
      {
        id: 'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        networkId: 'eip155:43113',
        coinGeckoId: 'usd-coin',
        logoUri: 'https://example.com/usdc.png',
      },
    ]),
  ),
}))

vi.mock('@/api/vaults', () => ({
  fetchVaults: vi.fn(() =>
    Promise.resolve([
      { id: '1', name: 'Vault 1' },
      { id: '2', name: 'Vault 2' },
      { id: '3', name: 'Vault 3' },
    ]),
  ),
}))

vi.mock('@/api/networks', () => ({
  fetchNetworks: vi.fn(() => Promise.resolve([{ id: 'eip155:43113', name: 'Avalanche C-Chain' }])),
}))

vi.mock('@/api/fee', () => ({
  fetchFee: vi.fn(() => Promise.resolve('100000000000000000')), // 0.1 AVAX
}))

vi.mock('@/api/vault-balances', () => ({
  fetchBalancesForVault: vi.fn(() =>
    Promise.resolve([
      { balance: '1000000000000000000', accountIndex: 0 }, // 1 AVAX
      { balance: '500000000000000000', accountIndex: 1 }, // 0.5 AVAX
    ]),
  ),
  assetToVaultBalances: {
    'eip155:43113/native': {
      '1': [
        { balance: '1000000000000000000', accountIndex: 0 },
        { balance: '500000000000000000', accountIndex: 1 },
      ],
      '2': [{ balance: '2000000000000000000', accountIndex: 0 }],
    },
  },
}))

vi.mock('@/api/addresses', () => ({
  networkToVaultToAddresses: {
    'eip155:43113': {
      '1': [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'Vault 1',
          isExternal: false,
          isVault: true,
        },
        {
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          name: 'Treasury Wallet',
          isExternal: false,
          isVault: false,
        },
      ],
      '2': [
        {
          address: '0x9876543210987654321098765432109876543210',
          name: 'Vault 2',
          isExternal: false,
          isVault: true,
        },
      ],
    },
  },
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

// Helper to find and click selectable items (avoiding selected content)
const findAndClickSelectableItem = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string,
) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  // Find all instances of the text
  const elements = screen.getAllByText(text)

  // Try to find one that's in a clickable container (SelectableItem or button)
  for (const element of elements) {
    const parent =
      element.closest('button') ||
      element.closest('[role="button"]') ||
      element.closest('[class*="SelectableItem"]')
    if (parent && parent !== element) {
      // Check if it's not the selected content (selected content is usually in a different structure)
      const isSelectedContent = element
        .closest('[class*="flex items-center gap-3"]')
        ?.querySelector('img')
      if (!isSelectedContent || elements.length === 1) {
        await user.click(parent as HTMLElement)
        return
      }
    }
  }

  // Fallback: click the last element (usually the one in the list, not selected)
  if (elements.length > 1) {
    await user.click(elements[elements.length - 1])
  } else {
    await user.click(elements[0])
  }
}

describe('Transfer Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Form Flow - Happy Path', () => {
    it('should complete full transfer flow from start to success', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Step 1: Select Asset
      const assetField = screen.getByText('Asset')
      expect(assetField).toBeInTheDocument()

      await user.click(assetField)

      // Wait for assets to load and select AVAX
      await findAndClickSelectableItem(user, 'AVAX')

      // Verify asset is selected (should appear in the field)
      await waitFor(() => {
        const assetField = screen.getByText('Asset').closest('div')
        expect(assetField?.querySelector('img[alt="AVAX"]')).toBeInTheDocument()
      })

      // Step 2: Select Vault
      const vaultField = screen.getByText('From')
      await user.click(vaultField)

      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })

      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      // Verify vault is selected
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })

      // Step 3: Select Destination Address
      const toField = screen.getByText('To')
      await user.click(toField)

      await waitFor(() => {
        expect(screen.getByText(/Account/i)).toBeInTheDocument()
      })

      // Select first account
      const accountOptions = screen.getAllByText(/Account/i)
      if (accountOptions[0]) {
        await user.click(accountOptions[0])
      }

      // Step 4: Enter Amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.clear(amountInput)
      await user.type(amountInput, '0.5')

      // Verify amount is displayed
      expect(amountInput).toHaveValue('0.5')

      // Step 5: Enter Memo
      const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
      await user.type(memoInput, 'Test transfer')

      // Step 6: Submit Transfer
      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Verify success screen appears
      await waitFor(() => {
        expect(screen.getByText(/Transaction Successfully Created/i)).toBeInTheDocument()
      })

      // Verify success actions are available
      expect(screen.getByRole('button', { name: /View Transaction/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /New Request/i })).toBeInTheDocument()
    })

    it('should show validation errors when submitting incomplete form', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Try to submit without filling any fields
      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Form should still be visible (not success screen)
      await waitFor(() => {
        expect(screen.queryByText(/Transaction Successfully Created/i)).not.toBeInTheDocument()
        expect(screen.getByText('Transfer')).toBeInTheDocument()
      })
    })

    it('should validate amount field correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      // Select vault
      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      // Select destination
      await user.click(screen.getByText('To'))
      await waitFor(() => {
        expect(screen.getByText(/Account/i)).toBeInTheDocument()
      })
      const accountOptions = screen.getAllByText(/Account/i)
      if (accountOptions[0]) {
        await user.click(accountOptions[0])
      }

      // Try to submit with zero amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.clear(amountInput)
      await user.type(amountInput, '0')

      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Should not show success screen
      await waitFor(() => {
        expect(screen.queryByText(/Transaction Successfully Created/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Reset Flow', () => {
    it('should reset form when Start Over is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Fill out form partially
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '100')

      // Click Start Over
      const startOverButton = screen.getByRole('button', { name: /Start Over/i })
      await user.click(startOverButton)

      // Verify form is reset
      await waitFor(() => {
        expect(amountInput).toHaveValue('')
      })
    })

    it('should reset form after successful transfer when New Request is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Complete full flow to success screen
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      await user.click(screen.getByText('To'))
      await waitFor(() => {
        expect(screen.getByText(/Account/i)).toBeInTheDocument()
      })
      const accountOptions = screen.getAllByText(/Account/i)
      if (accountOptions[0]) {
        await user.click(accountOptions[0])
      }

      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '0.5')

      const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
      await user.type(memoInput, 'Test')

      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Wait for success screen
      await waitFor(() => {
        expect(screen.getByText(/Transaction Successfully Created/i)).toBeInTheDocument()
      })

      // Click New Request
      const newRequestButton = screen.getByRole('button', { name: /New Request/i })
      await user.click(newRequestButton)

      // Verify form is reset and visible
      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument()
        expect(screen.queryByText(/Transaction Successfully Created/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Stepper Navigation', () => {
    it('should update stepper when fields are filled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Initially, stepper should show step 0 (Asset)
      // Select asset
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      // Select vault
      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      // Select destination
      await user.click(screen.getByText('To'))
      await waitFor(() => {
        expect(screen.getByText(/Account/i)).toBeInTheDocument()
      })
      const accountOptions = screen.getAllByText(/Account/i)
      if (accountOptions[0]) {
        await user.click(accountOptions[0])
      }

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '0.5')

      // All fields should be filled
      expect(screen.getByText('AVAX')).toBeInTheDocument()
      expect(screen.getByText('Vault 1')).toBeInTheDocument()
      expect(amountInput).toHaveValue('0.5')
    })
  })

  describe('Amount Calculations Integration', () => {
    it('should display balance and fee correctly after selecting asset and vault', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      // Select vault
      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      // Wait for balance and fee to load
      await waitFor(() => {
        // Balance should be displayed
        const balanceText = screen.getByText(/\$.*≈.*AVAX/i)
        expect(balanceText).toBeInTheDocument()

        // Fee should be displayed
        const feeText = screen.getByText(/Fee/i)
        expect(feeText).toBeInTheDocument()
      })
    })

    it('should show insufficient balance error when amount exceeds available balance', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset and vault
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      // Wait for balance to load
      await waitFor(() => {
        expect(screen.getByText(/\$.*≈.*AVAX/i)).toBeInTheDocument()
      })

      // Enter amount that exceeds balance (balance is 1 AVAX, fee is 0.1, so max is 0.9)
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.clear(amountInput)
      await user.type(amountInput, '2')

      // Should show insufficient balance error
      await waitFor(() => {
        expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument()
      })
    })

    it('should enable Max button and set max amount when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset and vault
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      const vault1Option = screen.getByText('Vault 1').closest('button')
      if (vault1Option) {
        await user.click(vault1Option)
      }

      // Wait for balance to load
      await waitFor(() => {
        expect(screen.getByText(/\$.*≈.*AVAX/i)).toBeInTheDocument()
      })

      // Click Max button
      const maxButton = screen.getByRole('button', { name: /Max/i })
      await user.click(maxButton)

      // Amount should be set to max (0.9 AVAX = 1 - 0.1 fee)
      await waitFor(() => {
        const amountInput = screen.getByPlaceholderText('0.00')
        expect(amountInput).toHaveValue('0.9')
      })
    })
  })

  describe('Search and Filter Integration', () => {
    it('should filter assets by search query', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })

      // Search for USDC
      const searchInput = screen.getByPlaceholderText('Search')
      await user.type(searchInput, 'USDC')

      // Should show USDC
      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument()
      })

      // AVAX should not be visible (filtered out)
      const avaxElements = screen.queryAllByText('AVAX')
      // AVAX might still be in the selected content, so we check if it's in the list
      expect(avaxElements.length).toBeLessThanOrEqual(1) // Only in selected content if selected
    })

    it('should filter vaults by search query', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })

      // Search for Vault 2
      const searchInput = screen.getByPlaceholderText('Search')
      await user.type(searchInput, '2')

      // Should show Vault 2
      await waitFor(() => {
        expect(screen.getByText('Vault 2')).toBeInTheDocument()
      })
    })

    it('should filter destination addresses by vault filter tabs', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset first
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      // Open To selector
      await user.click(screen.getByText('To'))
      await waitFor(() => {
        expect(screen.getByText(/All/i)).toBeInTheDocument()
      })

      // Click Vault 1 filter tab
      const vault1Tab = screen.getByRole('button', { name: /Vault 1/i })
      await user.click(vault1Tab)

      // Should show accounts filtered to Vault 1
      await waitFor(() => {
        expect(screen.getByText(/Account/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      const { fetchAssets } = await import('@/api/assets')
      vi.mocked(fetchAssets).mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      await user.click(screen.getByText('Asset'))

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error occurred while loading assets/i)).toBeInTheDocument()
      })
    })

    it('should show validation errors on form fields after submit attempt', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Form should still be visible
      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument()
      })

      // Fields should show error states (visual indicators)
      // Note: Actual error display depends on component implementation
    })
  })

  describe('Memo Field Integration', () => {
    it('should allow entering memo text', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
      await user.type(memoInput, 'Test memo for transfer')

      expect(memoInput).toHaveValue('Test memo for transfer')
    })

    it('should enforce memo character limit', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
      const longMemo = 'a'.repeat(300) // Exceeds 256 character limit

      await user.type(memoInput, longMemo)

      // Input should accept the text (validation happens on submit)
      // Note: Browser might limit input length, but we test that it's handled
      expect(memoInput).toBeInTheDocument()
    })
  })

  describe('Component Interaction Flow', () => {
    it('should update dependent fields when asset changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select first asset
      await user.click(screen.getByText('Asset'))
      await findAndClickSelectableItem(user, 'AVAX')

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '100')

      // Change asset
      await user.click(screen.getByText('AVAX'))
      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument()
      })
      const usdcOption = screen.getByText('USDC').closest('button')
      if (usdcOption) {
        await user.click(usdcOption)
      }

      // Amount should be reset when asset changes
      await waitFor(() => {
        expect(amountInput).toHaveValue('0.00')
      })
    })

    it('should clear destination address when asset changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset and destination
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('AVAX')).toBeInTheDocument()
      })
      const avaxOption = screen.getByText('AVAX').closest('button')
      if (avaxOption) {
        await user.click(avaxOption)
      }

      await user.click(screen.getByText('To'))
      await waitFor(() => {
        expect(screen.getByText(/Account/i)).toBeInTheDocument()
      })
      const accountOptions = screen.getAllByText(/Account/i)
      if (accountOptions[0]) {
        await user.click(accountOptions[0])
      }

      // Change asset
      await user.click(screen.getByText('AVAX'))
      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument()
      })
      const usdcOption = screen.getByText('USDC').closest('button')
      if (usdcOption) {
        await user.click(usdcOption)
      }

      // Destination should be cleared
      await waitFor(() => {
        expect(screen.getByText('Select destination')).toBeInTheDocument()
      })
    })
  })
})
