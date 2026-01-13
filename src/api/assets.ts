import { simulateApiRequest } from './utils'

export interface Asset {
  decimals: number
  id: string
  networkId: string
  coinGeckoId: string
  logoUri: string
  name: string
  symbol: string
}

const assets: Asset[] = [
  {
    id: 'avax:Sj7NVE3jXTbJvwFAiu7OEUo_8g8ctXMG/native',
    decimals: 9,
    networkId: 'avax:Sj7NVE3jXTbJvwFAiu7OEUo_8g8ctXMG',
    coinGeckoId: 'avalanche-2',
    logoUri:
      'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png',
    name: 'Avax',
    symbol: 'AVAX',
  },
  {
    decimals: 18,
    id: 'eip155:43113/native',
    coinGeckoId: 'avalanche-2',
    logoUri:
      'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png',
    name: 'Avax',
    symbol: 'AVAX',
    networkId: 'eip155:43113',
  },
  {
    decimals: 6,
    id: 'eip155:43113/erc20:0xb6076c93701d6a07266c31066b298aec6dd65c2d',
    coinGeckoId: 'usd-coin',
    logoUri: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    name: 'USD Coin',
    symbol: 'USDC',
    networkId: 'eip155:43113',
  },
  {
    decimals: 18,
    id: 'eip155:11155111/native',
    coinGeckoId: 'ethereum',
    logoUri: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    name: 'Ether',
    symbol: 'ETH',
    networkId: 'eip155:11155111',
  },
  {
    decimals: 6,
    id: 'eip155:11155111/erc20:0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
    coinGeckoId: 'usd-coin',
    logoUri: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    name: 'USD Coin',
    symbol: 'USDC',
    networkId: 'eip155:11155111',
  },
  {
    decimals: 8,
    id: 'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943/native',
    coinGeckoId: 'bitcoin',
    logoUri: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
    name: 'Bitcoin',
    symbol: 'BTC',
    networkId: 'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943',
  },
]

/**
 * Fetches all assets
 */
export const fetchAssets = () => simulateApiRequest(assets)
