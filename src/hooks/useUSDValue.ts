import { useMemo } from 'react'
import { formatUnits } from 'viem'
import type { Asset } from '@/api/assets'
import { ASSET_PRICES } from '@/utils/prices'

/**
 * Hook to calculate USD value from a balance
 * @param balance - Balance as bigint (in smallest unit)
 * @param asset - Asset with decimals and coinGeckoId
 * @returns USD value as number
 */
export const useUSDValue = (balance: bigint, asset: Asset | null): number => {
  return useMemo(() => {
    if (!asset || balance === BigInt(0)) {
      return 0
    }

    const price = ASSET_PRICES[asset.coinGeckoId] || 0
    const unformattedBalance = formatUnits(balance, asset.decimals)
    return Number(unformattedBalance) * price
  }, [balance, asset])
}

/**
 * Utility function to calculate USD value (for use outside hooks)
 */
export const calculateUSDValue = (balance: bigint, asset: Asset | null): number => {
  if (!asset || balance === BigInt(0)) {
    return 0
  }

  const price = ASSET_PRICES[asset.coinGeckoId] || 0
  const unformattedBalance = formatUnits(balance, asset.decimals)
  return Number(unformattedBalance) * price
}
