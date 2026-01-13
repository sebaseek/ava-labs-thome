import { simulateApiRequest } from './utils'

export interface Account {
  vaultId: string
  index: number
  name: string
}

export const accounts: Account[] = [
  {
    index: 0,
    vaultId: '1',
    name: 'Account 1',
  },
  {
    index: 1,
    vaultId: '1',
    name: 'Account 2',
  },
  {
    index: 2,
    vaultId: '1',
    name: 'Account 3',
  },
  {
    index: 0,
    vaultId: '2',
    name: 'Account 1',
  },
  {
    index: 1,
    vaultId: '2',
    name: 'Account 2',
  },
  {
    index: 0,
    vaultId: '3',
    name: 'Account 1',
  },
]

/**
 * Fetches all accounts
 */
export const fetchAccounts = async () => simulateApiRequest(accounts)
