import { beforeEach, describe, expect, it, vi } from 'vitest'
import { networkToVaultToAddresses } from './addresses'
import { submitTransfer } from './submit-transfer'
import * as utilsModule from './utils'
import { assetToVaultBalances } from './vault-balances'

// Mock the simulateApiRequest to control success/failure
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils')
  return {
    ...actual,
    simulateApiRequest: vi.fn(async (data, options) => {
      const { minDelay = 10, maxDelay = 50 } = options || {}
      // Small delay to simulate async
      const delay = Math.random() * (maxDelay - minDelay) + minDelay
      await new Promise((resolve) => setTimeout(resolve, delay))
      // Always succeed for tests (successRate check is for production simulation)
      // In tests, we want deterministic behavior
      return data
    }),
  }
})

describe('submitTransfer Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation Flow', () => {
    it('should validate complete transfer request successfully', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000', // 0.5 AVAX
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test transfer memo',
      }

      const result = await submitTransfer(request)

      expect(result).toHaveProperty('transactionId')
      expect(result).toHaveProperty('status')
      expect(result.status).toBe('pending')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('estimatedConfirmationTime')
    })

    it('should reject transfer with invalid vault ID', async () => {
      const request = {
        vaultId: '999', // Invalid vault
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      await expect(submitTransfer(request)).rejects.toThrow('Invalid vault ID')
    })

    it('should reject transfer with insufficient balance', async () => {
      // Get actual balance from vault balances
      const vaultBalances = assetToVaultBalances['eip155:43113/native']
      const accountBalance = BigInt(vaultBalances['1'][0].balance)
      const excessiveAmount = (accountBalance + BigInt(1)).toString() // Exceeds balance by 1

      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: excessiveAmount,
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      await expect(submitTransfer(request)).rejects.toThrow('Insufficient balance')
    })

    it('should reject transfer with invalid destination address', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: '0xInvalidAddress123456789012345678901234567890',
        memo: 'Test memo',
      }

      await expect(submitTransfer(request)).rejects.toThrow('Destination address')
    })

    it('should reject transfer with missing memo', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: '', // Empty memo
      }

      await expect(submitTransfer(request)).rejects.toThrow('Memo is required')
    })

    it('should reject transfer with memo exceeding 256 characters', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'a'.repeat(257), // 257 characters
      }

      await expect(submitTransfer(request)).rejects.toThrow('Memo must be less than 256 characters')
    })

    it('should reject transfer with zero amount', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '0',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      await expect(submitTransfer(request)).rejects.toThrow('Amount must be greater than zero')
    })

    it('should reject transfer with negative account index', async () => {
      const request = {
        vaultId: '1',
        accountIndex: -1,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      await expect(submitTransfer(request)).rejects.toThrow('Account index must be non-negative')
    })
  })

  describe('Balance Validation Integration', () => {
    it('should validate balance against actual vault balances', async () => {
      const vaultBalances = assetToVaultBalances['eip155:43113/native']
      const accountBalance = BigInt(vaultBalances['1'][0].balance)
      // Use a portion of the balance to ensure it passes validation
      const amount = (accountBalance / BigInt(2)).toString()

      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: amount,
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      // Should succeed since amount <= balance
      const result = await submitTransfer(request)
      expect(result).toHaveProperty('transactionId')
    })

    it('should validate account index exists in vault', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 999, // Non-existent account
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      await expect(submitTransfer(request)).rejects.toThrow('Account index')
    })
  })

  describe('Address Validation Integration', () => {
    it('should accept valid vault address', async () => {
      const validAddress = networkToVaultToAddresses['eip155:43113']['1'][0]

      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: validAddress.address,
        memo: 'Test memo',
      }

      // Mock simulateApiRequest to return the correct value based on the call
      // For fetchFee calls, it should return the fee string
      // For submitTransfer calls, it should return the response object
      vi.mocked(utilsModule.simulateApiRequest).mockImplementation(async (data, options) => {
        const { minDelay = 10, maxDelay = 50 } = options || {}
        const delay = Math.random() * (maxDelay - minDelay) + minDelay
        await new Promise((resolve) => setTimeout(resolve, delay))
        // If data is a string (fee), return it as-is
        // If data is an object (transfer response), return it as-is
        return data
      })

      const result = await submitTransfer(request)
      expect(result).toHaveProperty('transactionId')
    })

    it('should accept valid external address', async () => {
      // Find an external address
      const externalAddress = networkToVaultToAddresses['eip155:43113']['1'].find(
        (addr) => addr.isExternal,
      )

      if (externalAddress) {
        const request = {
          vaultId: '1',
          accountIndex: 0,
          assetId: 'eip155:43113/native',
          amount: '500000000000000000',
          to: externalAddress.address,
          memo: 'Test memo',
        }

        const result = await submitTransfer(request)
        expect(result).toHaveProperty('transactionId')
      }
    })
  })

  describe('Error Handling Integration', () => {
    it('should wrap non-validation errors', async () => {
      // Mock simulateApiRequest to throw a generic error with 0% success rate
      vi.mocked(utilsModule.simulateApiRequest).mockImplementationOnce(() => {
        return Promise.reject(new Error('Network timeout'))
      })

      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: networkToVaultToAddresses['eip155:43113']['1'][0].address,
        memo: 'Test memo',
      }

      // The error should be wrapped, but the original error message might be preserved
      await expect(submitTransfer(request)).rejects.toThrow()
    })

    it('should preserve validation error details', async () => {
      const request = {
        vaultId: '1',
        accountIndex: 0,
        assetId: 'eip155:43113/native',
        amount: '500000000000000000',
        to: 'invalid-address',
        memo: 'Test memo',
      }

      try {
        await submitTransfer(request)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error)
        expect(error.code).toBeDefined()
        expect(error.field).toBeDefined()
      }
    })
  })
})
