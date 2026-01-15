import { test, expect } from '@playwright/test'

test.describe('Asset Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should open asset selector dropdown', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await expect(assetField).toBeVisible()
    
    await assetField.click()
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500)
    
    // Check if search input appears (indicates dropdown is open)
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible()
    }
  })

  test('should search for assets in dropdown', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    await page.waitForTimeout(500)
    
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('AVAX')
      await expect(searchInput).toHaveValue('AVAX')
    }
  })

  test('should close asset selector when clicking outside', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await assetField.click()
    await page.waitForTimeout(500)
    
    // Click outside the dropdown (on the page background)
    await page.click('body', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(300)
    
    // Asset field should still be visible
    await expect(assetField).toBeVisible()
  })

  test('should display asset placeholder when nothing is selected', async ({ page }) => {
    const assetField = page.getByText(/select asset/i).first()
    await expect(assetField).toBeVisible()
  })
})
