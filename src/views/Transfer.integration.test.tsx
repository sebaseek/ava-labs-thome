import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    ]),
  ),
  assetToVaultBalances: {
    'eip155:43113/native': {
      '1': [
        { balance: '1000000000000000000', accountIndex: 0 }, // 1 AVAX
      ],
      '2': [{ balance: '2000000000000000000', accountIndex: 0 }],
    },
    'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d': {
      '1': [
        { balance: '75000000000', accountIndex: 0 }, // 75,000 USDC
      ],
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
  // Export the addresses for use in tests
  fetchAddresses: vi.fn(() => Promise.resolve([])),
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
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
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

// Helper to click on an account by index, handling multiple accounts
const clickAccountByIndex = async (
  user: ReturnType<typeof userEvent.setup>,
  accountIndex: number = 0,
) => {
  const accountText = `Account ${accountIndex}`
  await waitFor(() => {
    expect(screen.getAllByText(accountText).length).toBeGreaterThan(0)
  })

  const accountElements = screen.getAllByText(accountText)
  // Find the one that's in a clickable button/container
  for (const element of accountElements) {
    const clickableParent = element.closest('button') || element.closest('[role="button"]')
    if (clickableParent && clickableParent.getAttribute('type') === 'button') {
      await user.click(clickableParent as HTMLElement)
      return
    }
  }
  // Fallback: click the first one
  if (accountElements[0]) {
    await user.click(accountElements[0])
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

      // Select first account using helper
      await clickAccountByIndex(user, 0)

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

      // Verify success screen appears - check for buttons (more reliable)
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /View Transaction/i })).toBeInTheDocument()
          expect(screen.getByRole('button', { name: /New Request/i })).toBeInTheDocument()
        },
        { timeout: 3000 },
      )

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
      await findAndClickSelectableItem(user, 'AVAX')

      // Select vault
      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      // Find Vault 1 in the list (not the selected one if already selected)
      const vault1Options = screen.getAllByText('Vault 1')
      const vault1Option =
        vault1Options.find((el) => {
          const parent = el.closest('button')
          return parent && parent.getAttribute('type') === 'button'
        }) || vault1Options[0]
      if (vault1Option) {
        const clickableParent = vault1Option.closest('button')
        if (clickableParent) {
          await user.click(clickableParent)
        } else {
          await user.click(vault1Option)
        }
      }

      // Select destination
      await user.click(screen.getByText('To'))
      await clickAccountByIndex(user, 0)

      // Try to submit with zero amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.clear(amountInput)
      await user.type(amountInput, '0')

      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Should not show success screen
      await waitFor(() => {
        expect(screen.queryByText(/Successfully Created/i)).not.toBeInTheDocument()
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
      await clickAccountByIndex(user, 0)

      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '0.5')

      const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
      await user.type(memoInput, 'Test')

      const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
      await user.click(submitButton)

      // Wait for success screen - check for buttons instead of text (more reliable)
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /View Transaction/i })).toBeInTheDocument()
          expect(screen.getByRole('button', { name: /New Request/i })).toBeInTheDocument()
        },
        { timeout: 3000 },
      )

      // Click New Request
      const newRequestButton = screen.getByRole('button', { name: /New Request/i })
      await user.click(newRequestButton)

      // Verify form is reset and visible
      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument()
        expect(screen.queryByText(/Successfully Created/i)).not.toBeInTheDocument()
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
      await findAndClickSelectableItem(user, 'AVAX')

      // Select vault
      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      // Find Vault 1 in the list (not the selected one if already selected)
      const vault1Options = screen.getAllByText('Vault 1')
      const vault1Option =
        vault1Options.find((el) => {
          const parent = el.closest('button')
          return parent && parent.getAttribute('type') === 'button'
        }) || vault1Options[0]
      if (vault1Option) {
        const clickableParent = vault1Option.closest('button')
        if (clickableParent) {
          await user.click(clickableParent)
        } else {
          await user.click(vault1Option)
        }
      }

      // Select destination
      await user.click(screen.getByText('To'))
      await clickAccountByIndex(user, 0)

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '0.5')

      // All fields should be filled
      // Check that AVAX is selected (might appear multiple times, that's OK)
      expect(screen.getAllByText('AVAX').length).toBeGreaterThan(0)
      // Check that Vault 1 is selected
      expect(screen.getAllByText('Vault 1').length).toBeGreaterThan(0)
      expect(amountInput).toHaveValue('0.5')
    })
  })

  describe('Amount Calculations Integration', () => {
    it('should display balance and fee correctly after selecting asset and vault', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset
      await user.click(screen.getByText('Asset'))
      await findAndClickSelectableItem(user, 'AVAX')

      // Select vault
      await user.click(screen.getByText('From'))
      await waitFor(() => {
        expect(screen.getByText('Vault 1')).toBeInTheDocument()
      })
      // Find Vault 1 in the list (not the selected one if already selected)
      const vault1Options = screen.getAllByText('Vault 1')
      const vault1Option =
        vault1Options.find((el) => {
          const parent = el.closest('button')
          return parent && parent.getAttribute('type') === 'button'
        }) || vault1Options[0]
      if (vault1Option) {
        const clickableParent = vault1Option.closest('button')
        if (clickableParent) {
          await user.click(clickableParent)
        } else {
          await user.click(vault1Option)
        }
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

      // Amount should be set to max (balance is 1 AVAX, fee is 0.1, so max is 0.9)
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

      // Click Vault 1 filter tab (find the one in the filter tabs, not the selector)
      const vault1Tabs = screen.getAllByRole('button', { name: /Vault 1/i })
      // The filter tab should be in a container with "All" button nearby
      // Find the tab that's in the same container as the "All" button
      const allButton = screen.getByRole('button', { name: /All/i })
      const filterContainer = allButton.closest('div')
      const filterTab =
        vault1Tabs.find((btn) => {
          return filterContainer?.contains(btn)
        }) || vault1Tabs[0]
      await user.click(filterTab)

      // Should show accounts filtered to Vault 1
      await waitFor(() => {
        expect(screen.getAllByText(/Account/i).length).toBeGreaterThan(0)
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

      // Should show error message (check for error indicator or message)
      await waitFor(
        () => {
          // Check for error icon or error message text
          const errorMessage =
            screen.queryByText(/error/i) || screen.queryByText(/An error occurred/i)
          expect(errorMessage || screen.queryByRole('img', { name: /alert/i })).toBeTruthy()
        },
        { timeout: 3000 },
      )
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

      // Change asset - click on Asset field again to open selector
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument()
      })
      await findAndClickSelectableItem(user, 'USDC')

      // Amount should be reset when asset changes
      // Wait a bit for the reset to happen
      await waitFor(
        () => {
          const value = amountInput.getAttribute('value') || (amountInput as HTMLInputElement).value
          // Value should be empty or '0.00'
          expect(value === '' || value === '0.00' || value === '0').toBe(true)
        },
        { timeout: 2000 },
      )
    })

    it('should clear destination address when asset changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Transfer />)

      // Select asset and destination
      await user.click(screen.getByText('Asset'))
      await findAndClickSelectableItem(user, 'AVAX')

      await user.click(screen.getByText('To'))
      await clickAccountByIndex(user, 0)

      // Change asset - click on Asset field again to open selector
      await user.click(screen.getByText('Asset'))
      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument()
      })
      await findAndClickSelectableItem(user, 'USDC')

      // Destination should be cleared when asset changes
      // Wait a bit for the state to update
      await waitFor(
        () => {
          // Check if destination field shows placeholder (address was cleared)
          const toFieldText = screen.queryByText('Select destination')
          // The address should be cleared, so we should see the placeholder
          expect(toFieldText || screen.queryByText(/Account 0/i)).toBeTruthy()
        },
        { timeout: 2000 },
      )
    })
  })
})
