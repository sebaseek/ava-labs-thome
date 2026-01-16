import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { StartOverModal } from './StartOverModal'

describe('StartOverModal', () => {
  const defaultProps = {
    open: false,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window width to desktop by default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Desktop (Dialog)', () => {
    it('renders Dialog when not mobile', () => {
      render(<StartOverModal {...defaultProps} open={true} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Start over\?/)).toBeInTheDocument()
    })

    it('displays correct title and description on desktop', () => {
      render(<StartOverModal {...defaultProps} open={true} />)
      expect(screen.getByText(/Start over\?/)).toBeInTheDocument()
      expect(
        screen.getByText(/This will erase everything you've entered so far/),
      ).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
      render(<StartOverModal {...defaultProps} open={true} />)
      expect(screen.getByRole('button', { name: /Go back/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Yes, start over/i })).toBeInTheDocument()
    })

    it('calls onConfirm and closes modal when "Yes, start over" is clicked', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <StartOverModal {...defaultProps} open={true} onConfirm={onConfirm} onOpenChange={onOpenChange} />,
      )

      await user.click(screen.getByRole('button', { name: /Yes, start over/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('closes modal without calling onConfirm when "Go back" is clicked', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <StartOverModal {...defaultProps} open={true} onConfirm={onConfirm} onOpenChange={onOpenChange} />,
      )

      await user.click(screen.getByRole('button', { name: /Go back/i }))

      expect(onConfirm).not.toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('does not render when open is false', () => {
      render(<StartOverModal {...defaultProps} open={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Mobile (Drawer)', () => {
    beforeEach(() => {
      // Set window width to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
    })

    it('renders Drawer when mobile', () => {
      render(<StartOverModal {...defaultProps} open={true} />)
      // Drawer also uses dialog role
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Start over\?/)).toBeInTheDocument()
    })

    it('displays correct title and description on mobile', () => {
      render(<StartOverModal {...defaultProps} open={true} />)
      expect(screen.getByText(/Start over\?/)).toBeInTheDocument()
      expect(
        screen.getByText(/This will erase everything you've entered so far/),
      ).toBeInTheDocument()
    })

    it('calls onConfirm and closes modal when "Yes, start over" is clicked on mobile', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <StartOverModal {...defaultProps} open={true} onConfirm={onConfirm} onOpenChange={onOpenChange} />,
      )

      await user.click(screen.getByRole('button', { name: /Yes, start over/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('closes modal without calling onConfirm when "Go back" is clicked on mobile', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <StartOverModal {...defaultProps} open={true} onConfirm={onConfirm} onOpenChange={onOpenChange} />,
      )

      await user.click(screen.getByRole('button', { name: /Go back/i }))

      expect(onConfirm).not.toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
