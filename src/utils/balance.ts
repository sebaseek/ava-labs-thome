import { formatUnits } from 'viem'

/**
 * Converts a bigint balance to human-readable format using viem
 * Follows formatting rules:
 * - Remove trailing 0s (0.00 -> 0)
 * - Remove trailing "." (0. -> 0)
 * - "," separated thousands places (1000 -> 1,000)
 * - Ensure only 1 leading (001 -> 1, 00.1 -> 0.1)
 * @param balance - Balance in smallest unit (wei, satoshi, etc.)
 * @param decimals - Number of decimal places for the asset
 * @returns Formatted balance string
 */
export const formatBalance = (balance: bigint, decimals: number): string => {
  if (balance === BigInt(0)) {
    return '0'
  }

  const formatted = formatUnits(balance, decimals)
  return formatNumberWithCommas(formatted)
}

/**
 * Formats a number string with commas for thousands separators
 * Follows format: 5,430,420.99
 * Rules:
 * - Remove trailing 0s (0.00 -> 0)
 * - Remove trailing "." (0. -> 0)
 * - "," separated thousands places (1000 -> 1,000)
 * - Ensure only 1 leading (001 -> 1, 00.1 -> 0.1)
 * @param value - Number string to format
 * @returns Formatted string with commas (e.g., "5,430,420.99")
 */
export const formatNumberWithCommas = (value: string): string => {
  if (!value || value === '0' || value === '0.00' || value === '0.') return '0'

  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '')

  // Split by decimal point
  const parts = cleaned.split('.')
  let integerPart = parts[0] || ''
  let decimalPart = parts[1] || ''

  // Remove leading zeros from integer part (001 -> 1, but keep "0" if it's just "0")
  if (integerPart && integerPart.length > 1) {
    integerPart = integerPart.replace(/^0+/, '') || '0'
  }
  // Handle case where integer part is empty but we have decimal (e.g., ".5" -> "0.5")
  if (!integerPart && decimalPart) {
    integerPart = '0'
  }

  // Remove trailing zeros from decimal part (0.00 -> 0, 0.10 -> 0.1)
  if (decimalPart) {
    decimalPart = decimalPart.replace(/0+$/, '')
  }

  // Format integer part with commas (e.g., 5430420 -> 5,430,420)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Combine with decimal part
  // If decimal part is empty after removing trailing zeros, don't show the "."
  if (decimalPart) {
    return `${formattedInteger}.${decimalPart}`
  }

  return formattedInteger
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
