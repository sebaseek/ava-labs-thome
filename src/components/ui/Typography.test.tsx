import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Typography } from './Typography'

describe('Typography', () => {
  it('renders as paragraph by default', () => {
    render(<Typography>Test text</Typography>)
    const element = screen.getByText('Test text')
    expect(element.tagName).toBe('P')
  })

  it('renders as heading when variant is h1-h6', () => {
    const { rerender } = render(<Typography variant="h1">Heading 1</Typography>)
    expect(screen.getByText('Heading 1').tagName).toBe('H1')

    rerender(<Typography variant="h2">Heading 2</Typography>)
    expect(screen.getByText('Heading 2').tagName).toBe('H2')

    rerender(<Typography variant="h3">Heading 3</Typography>)
    expect(screen.getByText('Heading 3').tagName).toBe('H3')
  })

  it('renders as specified element when as prop is provided', () => {
    render(
      <Typography variant="h1" as="p">
        Paragraph styled as h1
      </Typography>,
    )
    const element = screen.getByText('Paragraph styled as h1')
    expect(element.tagName).toBe('P')
  })

  it('applies correct variant classes', () => {
    const { container } = render(<Typography variant="h1">Test</Typography>)
    const element = container.querySelector('h1')
    expect(element).toHaveClass('text-[48px]')
    expect(element).toHaveClass('font-bold')
  })

  it('applies custom className', () => {
    const { container } = render(<Typography className="custom-class">Test</Typography>)
    const element = container.querySelector('p')
    expect(element).toHaveClass('custom-class')
  })
})
