import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Mock browser APIs that vaul (drawer) library needs but aren't available in jsdom
beforeAll(() => {
  // Mock setPointerCapture for pointer events
  if (typeof Element !== 'undefined') {
    Element.prototype.setPointerCapture = vi.fn()
    Element.prototype.releasePointerCapture = vi.fn()
    Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false)
  }

  // Mock getComputedStyle for transform calculations
  const originalGetComputedStyle = window.getComputedStyle
  window.getComputedStyle = (element) => {
    const style = originalGetComputedStyle(element)
    // Mock transform property that vaul uses
    Object.defineProperty(style, 'transform', {
      value: 'none',
      writable: true,
    })
    return style
  }

  // Suppress expected vaul errors that may still occur
  const originalError = console.error
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || ''
    // Suppress vaul-specific errors that are expected in test environment
    if (
      errorMessage.includes('setPointerCapture') ||
      errorMessage.includes('getTranslate') ||
      (typeof args[0] === 'object' && args[0]?.message?.includes('setPointerCapture'))
    ) {
      return
    }
    originalError(...args)
  }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
