import { test, expect } from '@playwright/test'

test.describe('Navigation and Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should have Start Over button visible', async ({ page }) => {
    const startOverButton = page.getByRole('button', { name: /start over/i })
    await expect(startOverButton).toBeVisible()
    await expect(startOverButton).toBeEnabled()
  })

  test('should have Submit Transfer button visible', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /submit transfer/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('should reset form when Start Over is clicked', async ({ page }) => {
    // Fill memo field
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Test memo')
    await expect(memoInput).toHaveValue('Test memo')
    
    // Click Start Over
    await page.getByRole('button', { name: /start over/i }).click()
    
    // Memo should be cleared
    await expect(memoInput).toHaveValue('')
    
    // Form should still be visible
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
  })

  test('should maintain form state when navigating', async ({ page }) => {
    // Fill memo
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Persistent memo')
    
    // Click on different fields
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    await page.waitForTimeout(300)
    await page.keyboard.press('Escape') // Close dropdown if open
    
    // Memo should still have the value
    await expect(memoInput).toHaveValue('Persistent memo')
  })

  test('should handle multiple Start Over clicks', async ({ page }) => {
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    
    // Fill and reset multiple times
    for (let i = 0; i < 3; i++) {
      await memoInput.fill(`Memo ${i}`)
      await expect(memoInput).toHaveValue(`Memo ${i}`)
      
      await page.getByRole('button', { name: /start over/i }).click()
      await expect(memoInput).toHaveValue('')
    }
  })
})
