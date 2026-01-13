import { simulateApiRequest } from './utils'

export interface Vault {
  id: string
  name: string
}

const vaults: Vault[] = [
  {
    id: '1',
    name: 'Vault 1',
  },
  {
    id: '2',
    name: 'Vault 2',
  },
  {
    id: '3',
    name: 'Vault 3',
  },
]

export const fetchVaults = async () => simulateApiRequest(vaults)
