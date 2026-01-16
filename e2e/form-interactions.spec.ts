import { test, expect } from '@playwright/test'

test.describe('Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for assets to load
    await page.waitForLoadState('networkidle')
  })

  test('should allow typing in memo field', async ({ page }) => {
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    
    await expect(memoInput).toBeVisible()
    await memoInput.fill('Test memo message')
    
    await expect(memoInput).toHaveValue('Test memo message')
  })

  test('should clear memo field when typing new text', async ({ page }) => {
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    
    await memoInput.fill('First memo')
    await expect(memoInput).toHaveValue('First memo')
    
    await memoInput.clear()
    await memoInput.fill('Second memo')
    await expect(memoInput).toHaveValue('Second memo')
  })

  test('should interact with amount input field', async ({ page }) => {
    // First select an asset
    const assetField = page.getByText(/select asset/i).first()
    await expect(assetField).toBeVisible()
    await assetField.click()
    
    // Wait for and select an asset
    const assetOption = page.getByText(/AVAX|USDC|ETH|BTC/i).first()
    await expect(assetOption).toBeVisible({ timeout: 5000 })
    await assetOption.click()
    
    // Wait for the asset drawer to close and asset to be selected
    // Check that the asset name appears in the asset field (confirms selection)
    await expect(page.locator('button').filter({ hasText: /asset/i }).filter({ hasText: /AVAX|USDC|ETH|BTC/i }).first()).toBeVisible({ timeout: 5000 })
    
    // Wait for vault field to become enabled (indicates asset was selected and form state updated)
    // Find the button by looking for the button that contains the "From" label and "Select source" placeholder
    const vaultFieldButton = page.locator('button').filter({ hasText: /from/i }).filter({ hasText: /select source/i }).first()
    
    // Wait for the button to not have the disabled attribute and not have cursor-not-allowed class
    await expect(vaultFieldButton).not.toHaveAttribute('disabled', '', { timeout: 10000 })
    await expect(vaultFieldButton).not.toHaveClass(/cursor-not-allowed/, { timeout: 1000 })
    
    // Now select a vault (required to enable amount input)
    await expect(vaultFieldButton).toBeVisible()
    await vaultFieldButton.click()
    
    // Wait for vault dropdown to open and vaults to load
    const vaultOption = page.locator('button[data-slot="selectable-item"]').first()
    await expect(vaultOption).toBeVisible({ timeout: 5000 })
    await expect(vaultOption).toBeEnabled()
    await vaultOption.click()
    
    // Wait for vault dropdown to close by checking that vault option is no longer visible
    // (Note: the vault name will still be visible in the field, but the dropdown item should be gone)
    await expect(vaultOption).not.toBeVisible({ timeout: 3000 })
    
    // Now amount input should be enabled
    const amountInput = page.getByPlaceholder(/0\.00/i).first()
    await expect(amountInput).toBeEnabled({ timeout: 5000 })
    await amountInput.fill('100.50')
    // Amount input may normalize trailing zeros (100.50 -> 100.5)
    await expect(amountInput).toHaveValue(/100\.5/)
  })

  test('should display Max button when asset and vault are selected', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await expect(assetField).toBeVisible()
    await assetField.click()
    
    // Wait for and select an asset
    const assetOption = page.getByText(/AVAX|USDC|ETH|BTC/i).first()
    await expect(assetOption).toBeVisible({ timeout: 5000 })
    await assetOption.click()
    
    // Wait for the asset drawer to close and asset to be selected
    // Check that the asset name appears in the asset field (confirms selection)
    await expect(page.locator('button').filter({ hasText: /asset/i }).filter({ hasText: /AVAX|USDC|ETH|BTC/i }).first()).toBeVisible({ timeout: 5000 })
    
    // Wait for vault field to become enabled (indicates asset was selected and form state updated)
    // Find the button by looking for the button that contains the "From" label and "Select source" placeholder
    const vaultFieldButton = page.locator('button').filter({ hasText: /from/i }).filter({ hasText: /select source/i }).first()
    
    // Wait for the button to not have the disabled attribute and not have cursor-not-allowed class
    await expect(vaultFieldButton).not.toHaveAttribute('disabled', '', { timeout: 10000 })
    await expect(vaultFieldButton).not.toHaveClass(/cursor-not-allowed/, { timeout: 1000 })
    
    // Select a vault (required for Max button to appear)
    await expect(vaultFieldButton).toBeVisible()
    await vaultFieldButton.click()
    
    // Wait for vault dropdown to open and vaults to load
    const vaultOption = page.locator('button[data-slot="selectable-item"]').first()
    await expect(vaultOption).toBeVisible({ timeout: 5000 })
    await expect(vaultOption).toBeEnabled()
    await vaultOption.click()
    
    // Wait for vault dropdown to close
    await expect(vaultOption).not.toBeVisible({ timeout: 3000 })
    
    // Check for Max button
    const maxButton = page.getByRole('button', { name: /max/i })
    await expect(maxButton).toBeVisible({ timeout: 5000 })
  })

  test('should handle Start Over button click', async ({ page }) => {
    // Fill memo field first
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Test memo')
    await expect(memoInput).toHaveValue('Test memo')
    
    // Click Start Over to open modal
    const startOverButton = page.getByRole('button', { name: /start over/i })
    await startOverButton.click()
    
    // Modal should appear
    await expect(page.getByText(/Start over\?/)).toBeVisible()
    
    // Confirm reset
    await page.getByRole('button', { name: /yes, start over/i }).click()
    
    // Memo should be cleared
    await expect(memoInput).toHaveValue('')
  })
})
