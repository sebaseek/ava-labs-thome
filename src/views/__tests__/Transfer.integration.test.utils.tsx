import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { expect, vi } from 'vitest'

/**
 * Creates a test QueryClient with disabled retries and caching
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, refetchOnWindowFocus: false },
    },
  })

/**
 * Renders a component with QueryClientProvider wrapper
 */
export const renderWithProviders = (ui: ReactElement) => {
  const queryClient = createTestQueryClient()
  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  }
}

/**
 * Helper to find and click selectable items (avoiding selected content)
 */
export const findAndClickSelectableItem = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string,
) => {
  await waitFor(() => {
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
  })

  // Find all instances of the text
  const elements = screen.getAllByText(text)

  // Try to find one that's in a clickable container (SelectableItem or button)
  for (const element of elements) {
    const parent =
      element.closest('button') ||
      element.closest('[role="button"]') ||
      element.closest('[class*="SelectableItem"]')
    if (parent && parent !== element) {
      // Check if it's not the selected content (selected content is usually in a different structure)
      const isSelectedContent = element
        .closest('[class*="flex items-center gap-3"]')
        ?.querySelector('img')
      if (!isSelectedContent || elements.length === 1) {
        await user.click(parent as HTMLElement)
        return
      }
    }
  }

  // Fallback: click the last element (usually the one in the list, not selected)
  if (elements.length > 1) {
    await user.click(elements[elements.length - 1])
  } else {
    await user.click(elements[0])
  }
}

/**
 * Helper to wait for addresses to load
 */
export const waitForAddressesToLoad = async () => {
  await waitFor(
    () => {
      // Wait for either accounts to appear OR filter tabs to appear (both indicate addresses loaded)
      const accountElements = screen.queryAllByText(/Account \d+/)
      const allButton = screen.queryByText(/All/i)
      // Addresses are loaded if we see accounts OR the filter tabs (which only show when addresses are loaded)
      if (accountElements.length === 0 && !allButton) {
        throw new Error('Addresses not loaded yet')
      }
    },
    { timeout: 10000 },
  )
}

/**
 * Helper to click on an account by index, handling multiple accounts
 */
export const clickAccountByIndex = async (
  user: ReturnType<typeof userEvent.setup>,
  accountIndex: number = 0,
) => {
  // Wait for addresses to load first
  await waitForAddressesToLoad()

  const accountText = `Account ${accountIndex}`
  // Wait for the specific account to appear
  await waitFor(
    () => {
      const targetAccount = screen.queryAllByText(accountText)
      if (targetAccount.length === 0) {
        throw new Error(`Account ${accountIndex} not found`)
      }
    },
    { timeout: 2000 },
  )

  const accountElements = screen.getAllByText(accountText)
  // Find the one that's in a clickable button/container
  for (const element of accountElements) {
    const clickableParent = element.closest('button') || element.closest('[role="button"]')
    if (clickableParent && clickableParent.getAttribute('type') === 'button') {
      await user.click(clickableParent as HTMLElement)
      return
    }
  }
  // Fallback: click the first one
  if (accountElements[0]) {
    await user.click(accountElements[0])
  }
}

/**
 * Sets up common test environment - resets mocks and configures submitTransfer
 */
export const setupIntegrationTest = async () => {
  vi.clearAllMocks()
  // Reset submitTransfer mock to default success behavior
  const { submitTransfer } = await import('@/api/submit-transfer')
  vi.mocked(submitTransfer).mockResolvedValue({
    transactionId: 'test-tx-id-123',
    status: 'pending' as const,
    timestamp: Date.now(),
    estimatedConfirmationTime: 120,
  })
}
