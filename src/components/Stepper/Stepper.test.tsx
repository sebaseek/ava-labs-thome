import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('renders 5 steps', () => {
    const { container } = render(<Stepper activeStep={null} />)
    const steps = container.querySelectorAll('[class*="rounded-full"]')
    expect(steps).toHaveLength(5)
  })

  it('highlights active step', () => {
    const { container } = render(<Stepper activeStep={2} />)
    const steps = container.querySelectorAll('[class*="rounded-full"]')
    // Active step should have different height
    const activeStep = Array.from(steps).find((step) => step.className.includes('h-[40px]'))
    expect(activeStep).toBeDefined()
  })

  it('shows inactive steps with default styling', () => {
    const { container } = render(<Stepper activeStep={null} />)
    const steps = container.querySelectorAll('[class*="rounded-full"]')
    // All steps should be inactive (h-[5px])
    steps.forEach((step) => {
      expect(step.className).toContain('h-[5px]')
    })
  })

  it('handles null activeStep', () => {
    const { container } = render(<Stepper activeStep={null} />)
    const steps = container.querySelectorAll('[class*="rounded-full"]')
    expect(steps).toHaveLength(5)
  })
})
