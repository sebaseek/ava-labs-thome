import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MaxButton } from './MaxButton'

describe('MaxButton', () => {
  it('renders MAX button', () => {
    render(<MaxButton onClick={() => {}} isMaxAmount={false} />)
    expect(screen.getByRole('button', { name: /MAX/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked and not max amount', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<MaxButton onClick={handleClick} isMaxAmount={false} />)
    await user.click(screen.getByRole('button', { name: /MAX/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows tooltip when clicked and isMaxAmount is true', async () => {
    const user = userEvent.setup()
    render(<MaxButton onClick={() => {}} isMaxAmount />)
    await user.click(screen.getByRole('button', { name: /MAX/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/You've already entered the maximum amount available/i),
      ).toBeInTheDocument()
    })
  })

  it('shows tooltip when isMaxAmount is true and button is clicked', async () => {
    const user = userEvent.setup()
    render(<MaxButton onClick={() => {}} isMaxAmount />)

    const button = screen.getByRole('button', { name: /MAX/i })
    await user.click(button)

    // Tooltip should appear
    await waitFor(() => {
      expect(
        screen.getByText(/You've already entered the maximum amount available/i),
      ).toBeInTheDocument()
    })
  })
})
