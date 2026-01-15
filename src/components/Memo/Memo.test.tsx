import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Memo } from './Memo'

describe('Memo', () => {
  it('renders memo input', () => {
    render(<Memo value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText('Enter a memo')).toBeInTheDocument()
  })

  it('displays the value', () => {
    render(<Memo value="Test memo" onChange={() => {}} />)
    expect(screen.getByDisplayValue('Test memo')).toBeInTheDocument()
  })

  it('calls onChange when input changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Memo value="" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Enter a memo')
    await user.type(input, 'New memo')
    expect(handleChange).toHaveBeenCalled()
  })

  it('calls onFieldClick when input is focused', async () => {
    const user = userEvent.setup()
    const handleFieldClick = vi.fn()
    render(<Memo value="" onChange={() => {}} onFieldClick={handleFieldClick} />)
    const input = screen.getByPlaceholderText('Enter a memo')
    await user.click(input)
    // onFieldClick is called both on click and focus, so check for at least 1 call
    expect(handleFieldClick).toHaveBeenCalled()
  })

  it('applies correct styling when value is present', () => {
    const { container } = render(<Memo value="Test" onChange={() => {}} />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('text-blue-1')
  })
})
