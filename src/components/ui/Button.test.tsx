import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button', { name: /Click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles by default', () => {
    const { container } = render(<Button>Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-gold-highlight-3')
    expect(button).toHaveClass('text-gold-highlight-dark')
  })

  it('applies secondary variant styles', () => {
    const { container } = render(<Button variant="secondary">Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-blue-5-transparency-30')
    expect(button).toHaveClass('text-blue-2')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Test</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })
})
