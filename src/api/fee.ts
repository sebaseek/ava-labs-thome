import { simulateApiRequest } from './utils'

/**
 * Asset-based fee structure with realistic values
 * Fees are in the native token's smallest unit (wei, satoshi, etc.)
 * ERC20 tokens have slightly higher fees due to contract execution costs
 */
const ASSET_FEES = {
  // Avalanche P-Chain AVAX: 0.001 AVAX (9 decimals)
  'avax:Sj7NVE3jXTbJvwFAiu7OEUo_8g8ctXMG/native': '1000000', // 0.001 * 10^9

  // Avalanche C-Chain AVAX: 0.01 AVAX (18 decimals)
  'eip155:43113/native': '10000000000000000', // 0.01 * 10^18

  // USDC on Avalanche: 0.015 AVAX (18 decimals) - higher for ERC20
  'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d': '15000000000000000', // 0.015 * 10^18

  // Ethereum Sepolia ETH: 0.005 ETH (18 decimals)
  'eip155:11155111/native': '5000000000000000', // 0.005 * 10^18

  // USDC on Ethereum: 0.008 ETH (18 decimals) - higher for ERC20
  'eip155:11155111/erc20:0x1c7d4b196cb0c7b01d743fbc6116a902379c7238': '8000000000000000', // 0.008 * 10^18

  // Bitcoin Testnet: 0.0001 BTC (8 decimals)
  'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943/native': '10000', // 0.0001 * 10^8
}

/**
 * Fetches the fee for a given asset
 * Returns fee in the native token's smallest unit
 */
export const fetchFee = async (tokenId: string) => {
  try {
    const fee = ASSET_FEES[tokenId as keyof typeof ASSET_FEES]

    if (fee === undefined) {
      throw new Error(`No fee defined for asset: ${tokenId}`)
    }

    // Simulate API request with fee data
    return simulateApiRequest(fee, {
      successRate: 0.95,
      minDelay: 200,
      maxDelay: 800,
    })
  } catch (error) {
    throw new Error(
      `Failed to fetch fee for token ${tokenId}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
