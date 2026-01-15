import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TransferSuccess } from './TransferSuccess'

describe('TransferSuccess', () => {
  it('renders the success message', () => {
    render(<TransferSuccess />)
    expect(screen.getByText(/Successfully Created!/i)).toBeInTheDocument()
    // Check for Transaction text in the heading (not the button)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent(/Transaction/i)
  })

  it('renders the description text', () => {
    render(<TransferSuccess />)
    expect(
      screen.getByText(/Lorem ipsum dolor sit amet, consectetur adipiscing elit/i),
    ).toBeInTheDocument()
  })

  it('renders both buttons', () => {
    render(<TransferSuccess />)
    expect(screen.getByRole('button', { name: /View Transaction/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /New Request/i })).toBeInTheDocument()
  })

  it('calls onViewTransaction when View Transaction button is clicked', () => {
    const handleViewTransaction = vi.fn()
    render(<TransferSuccess onViewTransaction={handleViewTransaction} />)
    screen.getByRole('button', { name: /View Transaction/i }).click()
    expect(handleViewTransaction).toHaveBeenCalledTimes(1)
  })

  it('calls onNewRequest when New Request button is clicked', () => {
    const handleNewRequest = vi.fn()
    render(<TransferSuccess onNewRequest={handleNewRequest} />)
    screen.getByRole('button', { name: /New Request/i }).click()
    expect(handleNewRequest).toHaveBeenCalledTimes(1)
  })

  it('renders the ellipsis image', () => {
    render(<TransferSuccess />)
    const image = screen.getByAltText('Success')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('images/Ellipsis.png'))
  })

  it('has correct button styles', () => {
    render(<TransferSuccess />)
    const viewButton = screen.getByRole('button', { name: /View Transaction/i })
    const newRequestButton = screen.getByRole('button', { name: /New Request/i })

    expect(viewButton).toHaveClass('bg-blue-5-transparency-30')
    expect(viewButton).toHaveClass('text-blue-2')
    expect(newRequestButton).toHaveClass('bg-gold-highlight-3')
    expect(newRequestButton).toHaveClass('text-gold-highlight-dark')
  })
})
