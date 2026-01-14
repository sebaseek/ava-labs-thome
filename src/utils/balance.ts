/**
 * Converts a bigint balance to human-readable format
 * @param balance - Balance in smallest unit (wei, satoshi, etc.)
 * @param decimals - Number of decimal places for the asset
 * @returns Formatted balance string with up to 2 decimal places
 */
export const formatBalance = (balance: bigint, decimals: number): string => {
  if (balance === BigInt(0)) {
    return '0'
  }

  const divisor = BigInt(10 ** decimals)
  const wholePart = balance / divisor
  const fractionalPart = balance % divisor
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const fullNumber = parseFloat(`${wholePart.toString()}.${fractionalStr}`)

  // Format with up to 2 decimal places, removing trailing zeros
  return fullNumber.toFixed(2).replace(/\.?0+$/, '')
}

/**
 * Calculates total balance across all vaults for an asset
 * @param vaultData - Vault balances data structure
 * @returns Total balance as bigint
 */
export const calculateTotalBalance = (
  vaultData: Record<string, Array<{ balance: string; accountIndex: number }>>,
): bigint => {
  let totalBalance = BigInt(0)
  for (const vaultBalances of Object.values(vaultData)) {
    for (const accountBalance of vaultBalances) {
      totalBalance += BigInt(accountBalance.balance)
    }
  }
  return totalBalance
}
