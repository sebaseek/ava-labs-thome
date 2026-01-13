import { simulateApiRequest } from './utils'

interface Address {
  address: string
  name: string
  isExternal: boolean
  isVault: boolean
}

interface NetworkToVaultToAddresses {
  [networkId: string]: {
    [vaultId: string]: Address[]
  }
}

export const networkToVaultToAddresses: NetworkToVaultToAddresses = {
  // Avalanche P-Chain
  'avax:Sj7NVE3jXTbJvwFAiu7OEUo_8g8ctXMG': {
    '1': [
      {
        address: 'P-fuji1h2xn90pt5yhgxdpagg9675sz9khesay48cntrc',
        name: 'Vault 1',
        isExternal: false,
        isVault: true,
      },
      {
        address: 'P-fuji1wtgnd7haserp5dkyvxkrdxvl220rw7qv9xupg8',
        name: 'Treasury Wallet',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'P-fuji1abc123def456789ghi012jkl345mno678pqr901',
        name: 'Compliance Wallet',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'P-fuji1def456ghi789abc012jkl345mno678pqr901stu',
        name: 'Client Services',
        isExternal: true,
        isVault: false,
      },
    ],
    '2': [
      {
        address: 'P-fuji1esjfhttkpjuygz68kc3e5rv5rfnt98z5ezzwjh',
        name: 'Vault 2',
        isExternal: false,
        isVault: true,
      },
      {
        address: 'P-fuji1ghi789jkl012mno345pqr678stu901vwx234yza',
        name: 'Risk Management',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'P-fuji1jkl012mno345pqr678stu901vwx234yza567bcd',
        name: 'Institutional Fund',
        isExternal: true,
        isVault: false,
      },
      {
        address: 'P-fuji1mno345pqr678stu901vwx234yza567bcd890efg',
        name: 'Market Maker',
        isExternal: true,
        isVault: false,
      },
    ],
    '3': [
      {
        address: 'P-fuji17y8xf7ddfjwv0qg4zvuew0kucmylr749l44vrg',
        name: 'Vault 3',
        isExternal: false,
        isVault: true,
      },
      {
        address: 'P-fuji1l4f446pgxlaqtzttavrlch7e89rjgrfnjhj7yd',
        name: 'Partner Fund',
        isExternal: true,
        isVault: false,
      },
      {
        address: 'P-fuji1pqr678stu901vwx234yza567bcd890efg123hij',
        name: 'Staking Pool',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'P-fuji1stu901vwx234yza567bcd890efg123hij456klm',
        name: 'Yield Strategy',
        isExternal: true,
        isVault: false,
      },
      {
        address: 'P-fuji1vwx234yza567bcd890efg123hij456klm789nop',
        name: 'Liquidity Provider',
        isExternal: true,
        isVault: false,
      },
    ],
  },

  // Avalanche C-Chain (Fuji Testnet)
  'eip155:43113': {
    '1': [
      {
        address: '0x4C32821b728129c780E8dc4baC0294d8ea71e8Cc',
        name: 'Vault 1',
        isExternal: false,
        isVault: true,
      },
      {
        address: '0x714f65ED5674d349222e66e48F9c21019303b9Bc',
        name: 'Treasury Reserve',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0xa1b2c3d4e5f6789012345678901234567890abcd',
        name: 'DeFi Strategy',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0xb2c3d4e5f6789012345678901234567890abcdef1',
        name: 'Client Deposit',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0xc3d4e5f6789012345678901234567890abcdef12',
        name: 'External Exchange',
        isExternal: true,
        isVault: false,
      },
    ],
    '2': [
      {
        address: '0x6323bD8ce538fB98d0Ba47150A73D168aaDAF4ed',
        name: 'Vault 2',
        isExternal: false,
        isVault: true,
      },
      {
        address: '0x02b0e946FCb496510F68a3BE5a72e39721306068',
        name: 'FinTech Startup',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0xd4e5f6789012345678901234567890abcdef1234',
        name: 'Arbitrage Fund',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0xe5f6789012345678901234567890abcdef123456',
        name: 'Hedge Fund Alpha',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0xf6789012345678901234567890abcdef1234567',
        name: 'Pension Fund',
        isExternal: true,
        isVault: false,
      },
    ],
    '3': [
      {
        address: '0xc001e0aDFEAa71cfa76763964766ad60e36CFea7',
        name: 'Vault 3',
        isExternal: false,
        isVault: true,
      },
      {
        address: '0x13af70A0156BD5375dfbe7FBF367fc68FaEbd685',
        name: 'External Test',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0x789012345678901234567890abcdef123456789a',
        name: 'Insurance Fund',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x89012345678901234567890abcdef123456789ab',
        name: 'Custody Provider',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0x9012345678901234567890abcdef123456789abc',
        name: 'Validator Pool',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x012345678901234567890abcdef123456789abcd',
        name: 'Cross-Chain Bridge',
        isExternal: true,
        isVault: false,
      },
    ],
  },

  // Ethereum Sepolia Testnet
  'eip155:11155111': {
    '1': [
      {
        address: '0xa61a878653DC220DC9E048b348841b5C74dd7CdA',
        name: 'Vault 1',
        isExternal: false,
        isVault: true,
      },
      {
        address: '0x123456789abcdef0123456789abcdef012345678',
        name: 'Treasury Reserve',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x23456789abcdef0123456789abcdef0123456789',
        name: 'Yield Farming',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x3456789abcdef0123456789abcdef0123456789a',
        name: 'DEX Integration',
        isExternal: true,
        isVault: false,
      },
    ],
    '2': [
      {
        address: '0x5dDaDbcEdCb9791E0e3535f8DB67af188c797EDb',
        name: 'Vault 2',
        isExternal: false,
        isVault: true,
      },
      {
        address: '0x4C32821b728129c780E8dc4baC0294d8ea71e8Cc',
        name: 'Custody Wallet',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        name: 'Liquidity Mining',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x56789abcdef0123456789abcdef0123456789abc',
        name: 'Institutional Client',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0x6789abcdef0123456789abcdef0123456789abcd',
        name: 'Prime Brokerage',
        isExternal: true,
        isVault: false,
      },
    ],
    '3': [
      {
        address: '0x789abcdef0123456789abcdef0123456789abcde',
        name: 'Vault 3',
        isExternal: false,
        isVault: true,
      },
      {
        address: '0xfd3AB5F25751Ee2D6E1EEC3E33f13F5e3391bE70',
        name: 'External Partner',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0x027D93d9C6cC0e6d6855D3472570eB9988E68df3',
        name: 'Partner Wallet',
        isExternal: true,
        isVault: false,
      },
      {
        address: '0x89abcdef0123456789abcdef0123456789abcdef',
        name: 'Innovation Lab',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0x9abcdef0123456789abcdef0123456789abcdef0',
        name: 'Strategic Reserve',
        isExternal: false,
        isVault: false,
      },
      {
        address: '0xabcdef0123456789abcdef0123456789abcdef01',
        name: 'External Validator',
        isExternal: true,
        isVault: false,
      },
    ],
  },

  // Bitcoin Testnet
  'bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943': {
    '1': [
      {
        address: 'tb1qrzcjcy7ehmswg0982j2a77ehzjkfdxtt5l59pe',
        name: 'Vault 1',
        isExternal: false,
        isVault: true,
      },
      {
        address: 'tb1q123456789abcdef0123456789abcdef012345',
        name: 'Treasury Reserve',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'tb1q23456789abcdef0123456789abcdef0123456',
        name: 'Cold Storage',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'tb1q3456789abcdef0123456789abcdef01234567',
        name: 'Mining Pool',
        isExternal: true,
        isVault: false,
      },
    ],
    '2': [
      {
        address: 'tb1q2mrsqe0hxngzde225xkwcxnppma4l2zrnqvae7',
        name: 'Vault 2',
        isExternal: false,
        isVault: true,
      },
      {
        address: 'tb1q7s32wuhph7dqldq7n0730ana72kd0tns4yk5m9',
        name: 'Cold Storage',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'tb1q456789abcdef0123456789abcdef012345678',
        name: 'Multi-Sig Wallet',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'tb1q56789abcdef0123456789abcdef0123456789',
        name: 'Lightning Node',
        isExternal: true,
        isVault: false,
      },
      {
        address: 'tb1q6789abcdef0123456789abcdef0123456789a',
        name: 'Exchange Hot Wallet',
        isExternal: true,
        isVault: false,
      },
    ],
    '3': [
      {
        address: 'tb1q789abcdef0123456789abcdef0123456789ab',
        name: 'Vault 3',
        isExternal: false,
        isVault: true,
      },
      {
        address: 'tb1q0ldltzakykv7xk0dhfva6lpytd323v5s7v478p',
        name: 'External Partner',
        isExternal: true,
        isVault: false,
      },
      {
        address: 'tb1q89abcdef0123456789abcdef0123456789abc',
        name: 'Emergency Fund',
        isExternal: false,
        isVault: false,
      },
      {
        address: 'tb1q9abcdef0123456789abcdef0123456789abcd',
        name: 'OTC Trading',
        isExternal: true,
        isVault: false,
      },
      {
        address: 'tb1qabcdef0123456789abcdef0123456789abcde',
        name: 'Escrow Service',
        isExternal: true,
        isVault: false,
      },
    ],
  },
}

/**
 * Fetches addresses for a specific network and vault
 */
export const fetchAddressesForVault = (networkId: string, vaultId: string) => {
  try {
    const network = networkToVaultToAddresses[networkId]

    if (!network) {
      throw new Error(`Network not found: ${networkId}`)
    }

    const addresses = network[vaultId]

    if (!addresses) {
      throw new Error(`Vault ${vaultId} not found in network ${networkId}`)
    }

    return simulateApiRequest(addresses, {
      successRate: 0.95,
      minDelay: 200,
      maxDelay: 600,
    })
  } catch (error) {
    throw new Error(
      `Failed to fetch addresses for vault ${vaultId} on network ${networkId}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
