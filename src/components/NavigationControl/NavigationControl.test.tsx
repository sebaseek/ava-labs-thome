import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NavigationControl } from './NavigationControl'

describe('NavigationControl', () => {
  it('renders both buttons', () => {
    render(<NavigationControl onStartOver={() => {}} onSubmitTransfer={() => {}} />)
    expect(screen.getByRole('button', { name: /Start Over/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Transfer/i })).toBeInTheDocument()
  })

  it('calls onStartOver when Start Over is clicked', async () => {
    const user = userEvent.setup()
    const handleStartOver = vi.fn()
    render(<NavigationControl onStartOver={handleStartOver} onSubmitTransfer={() => {}} />)
    await user.click(screen.getByRole('button', { name: /Start Over/i }))
    expect(handleStartOver).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmitTransfer when Submit Transfer is clicked', async () => {
    const user = userEvent.setup()
    const handleSubmitTransfer = vi.fn()
    render(<NavigationControl onStartOver={() => {}} onSubmitTransfer={handleSubmitTransfer} />)
    await user.click(screen.getByRole('button', { name: /Submit Transfer/i }))
    expect(handleSubmitTransfer).toHaveBeenCalledTimes(1)
  })

  it('applies correct button styles', () => {
    render(<NavigationControl onStartOver={() => {}} onSubmitTransfer={() => {}} />)
    const startOverButton = screen.getByRole('button', { name: /Start Over/i })
    const submitButton = screen.getByRole('button', { name: /Submit Transfer/i })

    expect(startOverButton).toHaveClass('bg-blue-5-transparency-30')
    expect(startOverButton).toHaveClass('text-blue-2')
    expect(submitButton).toHaveClass('bg-gold-highlight-3')
    expect(submitButton).toHaveClass('text-gold-highlight-dark')
  })
})
