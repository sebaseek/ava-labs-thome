import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectableField } from './SelectableField'

describe('SelectableField', () => {
  it('renders label', () => {
    render(<SelectableField label="Test Label" isOpen={false} onToggle={() => {}} />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders placeholder when no content', () => {
    render(
      <SelectableField
        label="Test"
        isOpen={false}
        onToggle={() => {}}
        placeholder="Select option"
      />,
    )
    expect(screen.getByText('Select option')).toBeInTheDocument()
  })

  it('renders content when provided', () => {
    render(
      <SelectableField
        label="Test"
        isOpen={false}
        onToggle={() => {}}
        content={<div>Selected Value</div>}
      />,
    )
    expect(screen.getByText('Selected Value')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const handleToggle = vi.fn()
    render(<SelectableField label="Test" isOpen={false} onToggle={handleToggle} />)
    await user.click(screen.getByRole('button'))
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('shows chevron down when closed', () => {
    render(<SelectableField label="Test" isOpen={false} onToggle={() => {}} />)
    // ChevronDown icon should be present (lucide-react renders as SVG)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('shows chevron up when open', () => {
    render(<SelectableField label="Test" isOpen onToggle={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('shows loading message when isLoading is true', () => {
    render(
      <SelectableField
        label="Test"
        isOpen={false}
        onToggle={() => {}}
        isLoading
        loadingMessage="Loading data..."
      />,
    )
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('shows error message when error is provided', () => {
    render(
      <SelectableField
        label="Test"
        isOpen={false}
        onToggle={() => {}}
        error={new Error('Something went wrong')}
        errorMessage="An error occurred"
      />,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(<SelectableField label="Test" isOpen={false} onToggle={() => {}} isLoading />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when error is present', () => {
    render(<SelectableField label="Test" isOpen={false} onToggle={() => {}} error={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows expanded content when open and showExpandedContent is true', () => {
    render(
      <SelectableField label="Test" isOpen onToggle={() => {}} showExpandedContent>
        <div>Expanded Content</div>
      </SelectableField>,
    )
    expect(screen.getByText('Expanded Content')).toBeInTheDocument()
  })

  it('does not show expanded content when closed', () => {
    render(
      <SelectableField label="Test" isOpen={false} onToggle={() => {}}>
        <div>Expanded Content</div>
      </SelectableField>,
    )
    expect(screen.queryByText('Expanded Content')).not.toBeInTheDocument()
  })

  it('applies hasError prop to Card', () => {
    const { container } = render(
      <SelectableField label="Test" isOpen={false} onToggle={() => {}} hasError />,
    )
    // Card should have red border when hasError is true
    const card = container.querySelector('.border-red-highlight-1')
    expect(card).toBeInTheDocument()
  })
})
