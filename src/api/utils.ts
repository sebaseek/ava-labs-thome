/**
 * Utility functions for simulating async API requests with network delays and error scenarios
 */

export interface MockApiOptions {
  /** Minimum delay in milliseconds (default: 300) */
  minDelay?: number
  /** Maximum delay in milliseconds (default: 1500) */
  maxDelay?: number
  /** Probability of success (0-1, default: 0.9 = 90% success rate) */
  successRate?: number
  /** Custom error message (default: random error) */
  errorMessage?: string
  /** Enable console logging of requests (default: false) */
  enableLogging?: boolean
}

export interface MockApiError extends Error {
  code: string
  status: number
}

const DEFAULT_OPTIONS: Required<MockApiOptions> = {
  minDelay: 300,
  maxDelay: 1500,
  successRate: 0.9,
  errorMessage: '',
  enableLogging: false,
}

const MOCK_ERRORS = [
  { message: 'Network request failed', code: 'NETWORK_ERROR', status: 500 },
  { message: 'Request timeout', code: 'TIMEOUT', status: 408 },
  { message: 'Service unavailable', code: 'SERVICE_UNAVAILABLE', status: 503 },
  { message: 'Too many requests', code: 'RATE_LIMITED', status: 429 },
  { message: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
  { message: 'Bad gateway', code: 'BAD_GATEWAY', status: 502 },
] as const

/**
 * Simulates an async API request with realistic network delays and error scenarios
 *
 * @param data - The data to return on success
 * @param options - Configuration options for the simulation
 * @returns Promise that resolves with data or rejects with an error
 *
 * @example
 * ```typescript
 * // Basic usage
 * const userData = await simulateApiRequest({ id: 1, name: 'John' });
 *
 * // With custom options
 * const riskierRequest = await simulateApiRequest(
 *   { balances: [...] },
 *   {
 *     successRate: 0.7, // 70% success rate
 *     minDelay: 1000,    // Slower network
 *     maxDelay: 3000
 *   }
 * );
 *
 * // Always fails for testing error states
 * const errorTest = await simulateApiRequest(
 *   { data: 'test' },
 *   { successRate: 0, errorMessage: 'Custom error message' }
 * );
 * ```
 */
export const simulateApiRequest = async <T>(data: T, options: MockApiOptions = {}): Promise<T> => {
  const config = { ...DEFAULT_OPTIONS, ...options }

  // Generate random delay between min and max
  const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay

  if (config.enableLogging) {
    console.log(`🌐 Mock API: Starting request (delay: ${Math.round(delay)}ms)`)
  }

  // Wait for the simulated network delay
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Determine if request should succeed or fail
  const shouldSucceed = Math.random() < config.successRate

  if (shouldSucceed) {
    if (config.enableLogging) {
      console.log('✅ Mock API: Request succeeded', data)
    }
    return data
  } else {
    // Generate or use custom error
    const error = config.errorMessage
      ? { message: config.errorMessage, code: 'CUSTOM_ERROR', status: 400 }
      : MOCK_ERRORS[Math.floor(Math.random() * MOCK_ERRORS.length)]

    if (config.enableLogging) {
      console.error('❌ Mock API: Request failed', error)
    }

    const apiError = new Error(error.message) as MockApiError
    apiError.code = error.code
    apiError.status = error.status
    apiError.name = 'MockApiError'

    throw apiError
  }
}
