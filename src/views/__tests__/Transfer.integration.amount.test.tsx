import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Transfer } from '../Transfer'
import {
  findAndClickSelectableItem,
  renderWithProviders,
  setupIntegrationTest,
} from './Transfer.integration.test.utils'

// Mocks must be at top level for Vitest hoisting
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
  fetchFee: vi.fn(() => Promise.resolve('100000000000000000')),
}))

vi.mock('@/api/vault-balances', () => ({
  fetchBalancesForVault: vi.fn(() =>
    Promise.resolve([{ balance: '1000000000000000000', accountIndex: 0 }]),
  ),
  assetToVaultBalances: {
    'eip155:43113/native': {
      '1': [{ balance: '1000000000000000000', accountIndex: 0 }],
      '2': [{ balance: '2000000000000000000', accountIndex: 0 }],
    },
    'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d': {
      '1': [{ balance: '75000000000', accountIndex: 0 }],
    },
  },
}))

vi.mock('@/api/addresses', () => {
  const mockAddresses = {
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
  }
  return {
    networkToVaultToAddresses: mockAddresses,
    fetchAddressesForVault: vi.fn((networkId: string, vaultId: string) => {
      const network = mockAddresses[networkId as keyof typeof mockAddresses]
      if (!network) return Promise.reject(new Error(`Network ${networkId} not found`))
      const addresses = network[vaultId as keyof typeof network]
      if (!addresses) return Promise.reject(new Error(`Vault ${vaultId} not found`))
      return Promise.resolve(addresses)
    }),
  }
})

vi.mock('@/api/submit-transfer', () => ({
  submitTransfer: vi.fn(() =>
    Promise.resolve({
      transactionId: 'test-tx-id-123',
      status: 'pending' as const,
      timestamp: Date.now(),
      estimatedConfirmationTime: 120,
    }),
  ),
}))

describe('Transfer Integration Tests - Amount Calculations', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
  })

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

    // Amount should be set to max (balance - fee = 0.9 AVAX for native tokens)
    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText('0.00')
      expect(amountInput).toHaveValue('0.9')
    })
  })
})
