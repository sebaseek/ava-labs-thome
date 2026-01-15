import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Title should be visible
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
    
    // Buttons should be visible
    await expect(page.getByRole('button', { name: /start over/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /submit transfer/i })).toBeVisible()
  })

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad size
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start over/i })).toBeVisible()
  })

  test('should display correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }) // Desktop size
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start over/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /submit transfer/i })).toBeVisible()
  })

  test('should handle viewport resize', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Resize to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(300)
    
    // Form should still be functional
    await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible()
    const memoInput = page.getByPlaceholder(/enter a memo/i)
    await memoInput.fill('Test after resize')
    await expect(memoInput).toHaveValue('Test after resize')
  })
})
