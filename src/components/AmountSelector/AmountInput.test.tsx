import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AmountInput } from './AmountInput'

const mockAsset = {
  id: '1',
  symbol: 'VET',
  name: 'VeChain',
  decimals: 18,
  logoUri: '/vet.png',
  networkId: '1',
  price: '0.02',
}

describe('AmountInput', () => {
  it('renders input field', () => {
    render(<AmountInput value="" onChange={() => {}} selectedAsset={null} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays the value', () => {
    render(<AmountInput value="100.50" onChange={() => {}} selectedAsset={null} />)
    expect(screen.getByDisplayValue('100.50')).toBeInTheDocument()
  })

  it('calls onChange when input changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<AmountInput value="" onChange={handleChange} selectedAsset={null} />)
    const input = screen.getByRole('textbox')
    await user.type(input, '100')
    expect(handleChange).toHaveBeenCalled()
  })

  it('calls onFocus when input is focused', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    render(<AmountInput value="" onChange={() => {}} onFocus={handleFocus} selectedAsset={null} />)
    const input = screen.getByRole('textbox')
    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('shows asset symbol when asset is selected', () => {
    render(<AmountInput value="" onChange={() => {}} selectedAsset={mockAsset} />)
    expect(screen.getByText('VET')).toBeInTheDocument()
    expect(screen.getByAltText('VET')).toBeInTheDocument()
  })

  it('does not show asset symbol when asset is null', () => {
    render(<AmountInput value="" onChange={() => {}} selectedAsset={null} />)
    expect(screen.queryByText('VET')).not.toBeInTheDocument()
  })

  it('applies error styling when hasError is true', () => {
    const { container } = render(
      <AmountInput value="" onChange={() => {}} selectedAsset={null} hasError />,
    )
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-red-highlight-2')
  })

  it('applies default styling when hasError is false', () => {
    const { container } = render(
      <AmountInput value="" onChange={() => {}} selectedAsset={null} hasError={false} />,
    )
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-blue-5-transparency-30')
  })

  it('applies value styling when hasValue is true', () => {
    const { container } = render(
      <AmountInput value="100" onChange={() => {}} selectedAsset={null} hasValue />,
    )
    const input = container.querySelector('input')
    expect(input).toHaveClass('text-blue-1')
  })
})
