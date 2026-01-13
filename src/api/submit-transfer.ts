import { networkToVaultToAddresses } from './addresses'
import { simulateApiRequest } from './utils'
import { assetToVaultBalances } from './vault-balances'

interface TransferRequest {
  vaultId: string
  accountIndex: number
  assetId: string
  amount: string
  to: string
  memo: string
}

interface TransferResponse {
  transactionId: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  estimatedConfirmationTime: number // seconds
}

class TransferValidationError extends Error {
  code: string
  field?: string

  constructor(code: string, message: string, field?: string) {
    super(message)
    this.name = 'TransferValidationError'
    this.code = code
    this.field = field
  }
}

/**
 * Validates transfer request parameters
 */
const validateTransferRequest = (request: TransferRequest) => {
  const { vaultId, accountIndex, assetId, amount, to, memo } = request

  // Basic field validation
  if (!vaultId || !['1', '2', '3'].includes(vaultId)) {
    throw new TransferValidationError(
      'INVALID_VAULT',
      'Invalid vault ID. Must be 1, 2, or 3.',
      'vaultId',
    )
  }

  if (accountIndex < 0) {
    throw new TransferValidationError(
      'INVALID_ACCOUNT_INDEX',
      'Account index must be non-negative.',
      'accountIndex',
    )
  }

  if (!assetId) {
    throw new TransferValidationError('MISSING_ASSET', 'Asset ID is required.', 'assetId')
  }

  if (!amount || amount === '0') {
    throw new TransferValidationError(
      'INVALID_AMOUNT',
      'Amount must be greater than zero.',
      'amount',
    )
  }

  if (!to) {
    throw new TransferValidationError(
      'MISSING_TO_ADDRESS',
      'Destination address is required.',
      'to',
    )
  }

  if (!memo || memo.trim().length === 0) {
    throw new TransferValidationError('MISSING_MEMO', 'Memo is required.', 'memo')
  }

  if (memo.length > 256) {
    throw new TransferValidationError(
      'MEMO_TOO_LONG',
      'Memo must be less than 256 characters.',
      'memo',
    )
  }

  // Validate destination address exists and is accessible
  try {
    const networkId = getNetworkIdFromAssetId(assetId)
    let addressExists = false

    // Check if address exists in any vault for this network
    for (const vault of Object.keys(networkToVaultToAddresses[networkId] || {})) {
      const addresses = networkToVaultToAddresses[networkId][vault]
      if (addresses.some((addr) => addr.address === to)) {
        addressExists = true
        break
      }
    }

    if (!addressExists) {
      throw new TransferValidationError(
        'INVALID_TO_ADDRESS',
        'Destination address is not recognized or not whitelisted.',
        'to',
      )
    }
  } catch (error) {
    if (error instanceof TransferValidationError) {
      throw error
    }
    throw new TransferValidationError(
      'ADDRESS_VALIDATION_FAILED',
      'Failed to validate destination address.',
      'to',
    )
  }

  // Validate sufficient balance
  try {
    const vaultBalances = assetToVaultBalances[assetId]

    if (!vaultBalances || !vaultBalances[vaultId]) {
      throw new TransferValidationError(
        'VAULT_NOT_FOUND',
        `No balances found for vault ${vaultId} and asset ${assetId}.`,
        'vaultId',
      )
    }

    const accountBalance = vaultBalances[vaultId].find(
      (account) => account.accountIndex === accountIndex,
    )

    if (!accountBalance) {
      throw new TransferValidationError(
        'ACCOUNT_NOT_FOUND',
        `Account index ${accountIndex} not found in vault ${vaultId}.`,
        'accountIndex',
      )
    }

    const balance = BigInt(accountBalance.balance)
    const transferAmount = BigInt(amount)

    if (transferAmount > balance) {
      throw new TransferValidationError(
        'INSUFFICIENT_BALANCE',
        `Insufficient balance. Available: ${balance.toString()}, Requested: ${amount}`,
        'amount',
      )
    }

    if (transferAmount === balance) {
      // Warn about full balance transfer (might need to account for fees)
      console.warn('Warning: Transferring full balance. Consider transaction fees.')
    }
  } catch (error) {
    if (error instanceof TransferValidationError) {
      throw error
    }
    throw new TransferValidationError(
      'BALANCE_VALIDATION_FAILED',
      'Failed to validate account balance.',
      'amount',
    )
  }
}

/**
 * Extracts network ID from asset ID
 */
const getNetworkIdFromAssetId = (assetId: string): string => {
  // Extract network portion from asset ID
  if (assetId.includes('/native')) {
    return assetId.replace('/native', '')
  }
  if (assetId.includes('/erc20:')) {
    return assetId.split('/erc20:')[0]
  }
  throw new Error(`Unable to extract network ID from asset ID: ${assetId}`)
}

/**
 * Generates a random transaction ID
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  return `tx_${timestamp}_${random}`
}

/**
 * Submits a transfer request with comprehensive validation
 */
export const submitTransfer = async (request: TransferRequest) => {
  try {
    // Validate the transfer request
    validateTransferRequest(request)

    // Simulate the transfer submission
    const response: TransferResponse = {
      transactionId: generateTransactionId(),
      status: 'pending',
      timestamp: Date.now(),
      estimatedConfirmationTime: Math.random() * 300 + 60, // 1-5 minutes
    }

    // Simulate API request with potential failure
    return simulateApiRequest(response, {
      successRate: 0.85, // 85% success rate
      minDelay: 1000, // 1-3 second processing time
      maxDelay: 3000,
      enableLogging: true,
    })
  } catch (error) {
    if (error instanceof TransferValidationError) {
      // Re-throw validation errors as-is
      throw error
    }

    // Wrap other errors
    throw new TransferValidationError(
      'TRANSFER_SUBMISSION_FAILED',
      `Transfer submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
