import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitTransfer } from '@/api/submit-transfer'
import { Transfer } from '../Transfer'
import {
  clickAccountByIndex,
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

describe('Transfer Integration Tests - Submit Transfer', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
  })

  it('should call submitTransfer with correct parameters on successful submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Transfer />)

    // Complete form
    await user.click(screen.getByText('Asset'))
    await waitFor(() => {
      expect(screen.getByText('AVAX')).toBeInTheDocument()
    })
    await findAndClickSelectableItem(user, 'AVAX')

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
    await user.clear(amountInput)
    await user.type(amountInput, '0.5')

    const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
    await user.type(memoInput, 'Test transfer memo')

    // Submit transfer
    const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
    await user.click(submitButton)

    // Wait for submitTransfer to be called
    await waitFor(() => {
      expect(submitTransfer).toHaveBeenCalled()
    })

    // Verify submitTransfer was called with correct parameters
    expect(submitTransfer).toHaveBeenCalledWith({
      vaultId: '1',
      accountIndex: 0,
      assetId: 'eip155:43113/native',
      amount: '500000000000000000', // 0.5 AVAX in smallest units (18 decimals)
      to: '0x1234567890123456789012345678901234567890',
      memo: 'Test transfer memo',
    })

    // Verify success screen appears
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /View Transaction/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /New Request/i })).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('should convert amount correctly for different decimal places', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Transfer />)

    // Select USDC (6 decimals) instead of AVAX (18 decimals)
    await user.click(screen.getByText('Asset'))
    await waitFor(() => {
      expect(screen.getByText('USDC')).toBeInTheDocument()
    })
    await findAndClickSelectableItem(user, 'USDC')

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
    await user.clear(amountInput)
    await user.type(amountInput, '100.5') // 100.5 USDC

    const memoInput = screen.getByPlaceholderText(/Enter a memo/i)
    await user.type(memoInput, 'USDC transfer')

    // Submit transfer
    const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
    await user.click(submitButton)

    // Wait for submitTransfer to be called
    await waitFor(() => {
      expect(submitTransfer).toHaveBeenCalled()
    })

    // Verify amount is converted correctly for 6 decimals: 100.5 * 10^6 = 100500000
    expect(submitTransfer).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId: 'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d',
        amount: '100500000', // 100.5 USDC in smallest units (6 decimals)
        memo: 'USDC transfer',
      }),
    )
  })

  it('should trim memo before submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Transfer />)

    // Complete form
    await user.click(screen.getByText('Asset'))
    await waitFor(() => {
      expect(screen.getByText('AVAX')).toBeInTheDocument()
    })
    await findAndClickSelectableItem(user, 'AVAX')

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
    await user.type(memoInput, '  Memo with spaces  ') // Memo with leading/trailing spaces

    // Submit transfer
    const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })
    await user.click(submitButton)

    // Wait for submitTransfer to be called
    await waitFor(() => {
      expect(submitTransfer).toHaveBeenCalled()
    })

    // Verify memo is trimmed
    expect(submitTransfer).toHaveBeenCalledWith(
      expect.objectContaining({
        memo: 'Memo with spaces', // Should be trimmed
      }),
    )
  })
})
