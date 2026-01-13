import { simulateApiRequest } from './utils'

interface Network {
  id: string
  name: string
}

const networks: Network[] = [
  {
    id: 'avax:Sj7NVE3jXTbJvwFAiu7OEUo_8g8ctXMG',
    name: 'Avalanche P-Chain',
  },
  {
    id: 'eip155:43113',
    name: 'Avalanche C-Chain',
  },
  {
    id: 'eip155:11155111',
    name: 'Ethereum',
  },
  {
    id: 'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943',
    name: 'Bitcoin',
  },
]

/**
 * Fetches all networks
 */
export const fetchNetworks = async () => simulateApiRequest(networks)
