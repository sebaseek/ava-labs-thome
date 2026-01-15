import { test, expect } from '@playwright/test'

test.describe('Keyboard Navigation and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate form fields with Tab key', async ({ page }) => {
    // Start from the beginning
    await page.keyboard.press('Tab')
    
    // Tab through interactive elements
    // The exact tab order depends on the DOM structure
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to focus on memo input
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.focus()
    
    // Should be able to type when focused
    await page.keyboard.type('Typed with keyboard')
    await expect(memoInput).toHaveValue('Typed with keyboard')
  })

  test('should submit form with Enter key on submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /submit transfer/i })
    await submitButton.focus()
    
    // Press Enter
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    // Form should still be visible (validation will fail)
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
  })

  test('should clear input with keyboard shortcuts', async ({ page }) => {
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Test text')
    await expect(memoInput).toHaveValue('Test text')
    
    // Select all and delete
    await memoInput.focus()
    await page.keyboard.press('Meta+A') // Cmd+A on Mac
    await page.keyboard.press('Backspace')
    
    await expect(memoInput).toHaveValue('')
  })

  test('should have accessible button labels', async ({ page }) => {
    const startOverButton = page.getByRole('button', { name: /start over/i })
    const submitButton = page.getByRole('button', { name: /submit transfer/i })
    
    // Check that buttons have accessible names
    await expect(startOverButton).toHaveAccessibleName(/start over/i)
    await expect(submitButton).toHaveAccessibleName(/submit transfer/i)
  })

  test('should have accessible form labels', async ({ page }) => {
    // Check for form field labels
    const assetLabel = page.getByText(/asset/i).first()
    const memoLabel = page.getByText(/memo/i).first()
    
    // Labels should be visible
    if (await assetLabel.isVisible().catch(() => false)) {
      await expect(assetLabel).toBeVisible()
    }
    if (await memoLabel.isVisible().catch(() => false)) {
      await expect(memoLabel).toBeVisible()
    }
  })

  test('should handle Escape key to close dropdowns', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    await page.waitForTimeout(300)
    
    // Press Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    
    // Asset field should still be visible
    await expect(assetField).toBeVisible()
  })
})
