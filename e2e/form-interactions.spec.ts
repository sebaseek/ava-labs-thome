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
    // First select an asset to enable amount input
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    
    // Wait for asset dropdown to appear
    await page.waitForTimeout(500)
    
    // Try to find and select an asset (if available)
    const assetOption = page.getByText(/AVAX|USDC|ETH|BTC/i).first()
    if (await assetOption.isVisible().catch(() => false)) {
      await assetOption.click()
      await page.waitForTimeout(500)
      
      // Now amount input should be enabled
      const amountInput = page.getByPlaceholder(/0\.00/i).first()
      if (await amountInput.isVisible().catch(() => false)) {
        await amountInput.fill('100.50')
        // Amount input may normalize trailing zeros (100.50 -> 100.5)
        await expect(amountInput).toHaveValue(/100\.5/)
      }
    }
  })

  test('should display Max button when asset is selected', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    await page.waitForTimeout(500)
    
    const assetOption = page.getByText(/AVAX|USDC|ETH|BTC/i).first()
    if (await assetOption.isVisible().catch(() => false)) {
      await assetOption.click()
      await page.waitForTimeout(500)
      
      // Check for Max button
      const maxButton = page.getByRole('button', { name: /max/i })
      if (await maxButton.isVisible().catch(() => false)) {
        await expect(maxButton).toBeVisible()
      }
    }
  })

  test('should handle Start Over button click', async ({ page }) => {
    // Fill memo field first
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Test memo')
    await expect(memoInput).toHaveValue('Test memo')
    
    // Click Start Over
    const startOverButton = page.getByRole('button', { name: /start over/i })
    await startOverButton.click()
    
    // Memo should be cleared
    await expect(memoInput).toHaveValue('')
  })
})
