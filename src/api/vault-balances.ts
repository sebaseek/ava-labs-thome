import { simulateApiRequest } from './utils'

interface AccountBalance {
  balance: string
  accountIndex: number
}

export interface AssetToVaultBalances {
  [assetId: string]: {
    [vaultId: string]: AccountBalance[]
  }
}

export const assetToVaultBalances: AssetToVaultBalances = {
  // AVAX (18 decimals, ~$25.46 per token)
  'eip155:43113/native': {
    '1': [
      { balance: '3339740000000000000000', accountIndex: 0 }, // 3,339.74 AVAX (~$85,000)
      { balance: '1669870000000000000000', accountIndex: 1 }, // 1,669.87 AVAX (~$42,500)
    ],
    '2': [
      { balance: '4909090000000000000000', accountIndex: 0 }, // 4,909.09 AVAX (~$125,000)
    ],
    '3': [], // Empty vault
  },

  // USDC on Avalanche (6 decimals, $1.00 per token)
  'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d': {
    '1': [
      { balance: '75000000000', accountIndex: 0 }, // 75,000 USDC ($75,000)
      { balance: '32000000000', accountIndex: 1 }, // 32,000 USDC ($32,000)
    ],
    '2': [
      { balance: '189000000000', accountIndex: 0 }, // 189,000 USDC ($189,000)
    ],
    '3': [
      { balance: '45600000000', accountIndex: 0 }, // 45,600 USDC ($45,600)
    ],
  },

  // ETH on Ethereum Sepolia (18 decimals, ~$4,311.56 per token)
  'eip155:11155111/native': {
    '1': [
      { balance: '34800000000000000000', accountIndex: 0 }, // 34.8 ETH (~$150,000)
    ],
    '2': [
      { balance: '20650000000000000000', accountIndex: 0 }, // 20.65 ETH (~$89,000)
      { balance: '15540000000000000000', accountIndex: 1 }, // 15.54 ETH (~$67,000)
    ],
    '3': [], // Empty vault
  },

  // USDC on Ethereum Sepolia (6 decimals, $1.00 per token)
  'eip155:11155111/erc20:0x1c7d4b196cb0c7b01d743fbc6116a902379c7238': {
    '1': [
      { balance: '98000000000', accountIndex: 0 }, // 98,000 USDC ($98,000)
    ],
    '2': [], // Empty vault
    '3': [
      { balance: '156000000000', accountIndex: 0 }, // 156,000 USDC ($156,000)
      { balance: '67000000000', accountIndex: 1 }, // 67,000 USDC ($67,000)
    ],
  },

  // BTC (8 decimals, ~$112,213.21 per token)
  'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943/native': {
    '1': [
      { balance: '158700000', accountIndex: 0 }, // 1.587 BTC (~$178,000)
    ],
    '2': [
      { balance: '79400000', accountIndex: 0 }, // 0.794 BTC (~$89,000)
      { balance: '238100000', accountIndex: 1 }, // 2.381 BTC (~$267,000)
    ],
    '3': [], // Empty vault
  },
}

/**
 * Fetches balances for a specific asset and vault
 */
export const fetchBalancesForVault = (assetId: string, vaultId: string) => {
  try {
    const asset = assetToVaultBalances[assetId]

    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    const vaultBalances = asset[vaultId]

    if (!vaultBalances) {
      throw new Error(`Vault ${vaultId} not found for asset ${assetId}`)
    }

    return simulateApiRequest(vaultBalances, {
      successRate: 0.95,
      minDelay: 200,
      maxDelay: 600,
    })
  } catch (error) {
    throw new Error(
      `Failed to fetch balances for vault ${vaultId} and asset ${assetId}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
