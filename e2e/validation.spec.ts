import { test, expect } from '@playwright/test'

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should prevent submission with missing asset', async ({ page }) => {
    // Try to submit without selecting asset
    await page.getByRole('button', { name: /submit transfer/i }).click()
    await page.waitForTimeout(500)
    
    // Form should still be visible (validation failed)
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
  })

  test('should prevent submission with missing vault', async ({ page }) => {
    // Select asset first
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    await page.waitForTimeout(500)
    
    const assetOption = page.getByText(/AVAX|USDC|ETH|BTC/i).first()
    if (await assetOption.isVisible().catch(() => false)) {
      await assetOption.click()
      await page.waitForTimeout(500)
      
      // Try to submit without selecting vault
      await page.getByRole('button', { name: /submit transfer/i }).click()
      await page.waitForTimeout(500)
      
      // Form should still be visible
      await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
    }
  })

  test('should show form fields after failed validation', async ({ page }) => {
    await page.getByRole('button', { name: /submit transfer/i }).click()
    await page.waitForTimeout(500)
    
    // All form fields should still be visible
    await expect(page.getByText(/select asset/i).first()).toBeVisible()
    await expect(page.getByPlaceholder(/enter a memo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /start over/i })).toBeVisible()
  })

  test('should allow editing after failed validation', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /submit transfer/i }).click()
    await page.waitForTimeout(500)
    
    // Should still be able to edit memo
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Test after validation')
    await expect(memoInput).toHaveValue('Test after validation')
  })
})
