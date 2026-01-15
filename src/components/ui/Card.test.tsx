import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>,
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default hover styles', () => {
    const { container } = render(
      <Card>
        <div>Test</div>
      </Card>,
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('hover:bg-white')
  })

  it('disables hover when hover prop is false', () => {
    const { container } = render(
      <Card hover={false}>
        <div>Test</div>
      </Card>,
    )
    const card = container.firstChild as HTMLElement
    expect(card).not.toHaveClass('hover:bg-white')
  })

  it('shows red border when hasError is true', () => {
    const { container } = render(
      <Card hasError>
        <div>Test</div>
      </Card>,
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('border-red-highlight-1')
    expect(card).not.toHaveClass('border-card-border')
  })

  it('shows default border when hasError is false', () => {
    const { container } = render(
      <Card hasError={false}>
        <div>Test</div>
      </Card>,
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('border-card-border')
    expect(card).not.toHaveClass('border-red-highlight-1')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <div>Test</div>
      </Card>,
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-class')
  })
})
