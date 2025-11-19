import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricsCard from '@/components/admin/monetization/MetricsCard'
import { DollarSign } from 'lucide-react'

describe('MetricsCard', () => {
  it('should render title and value', () => {
    render(<MetricsCard title="Total Revenue" value="$12,345" />)

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$12,345')).toBeInTheDocument()
  })

  it('should render numeric value', () => {
    render(<MetricsCard title="Active Partnerships" value={42} />)

    expect(screen.getByText('Active Partnerships')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display change percentage when provided', () => {
    render(<MetricsCard title="Revenue" value="$100" change={15} />)

    expect(screen.getByText('+15%')).toBeInTheDocument()
    expect(screen.getByText('vs last period')).toBeInTheDocument()
  })

  it('should display negative change percentage', () => {
    render(<MetricsCard title="Revenue" value="$100" change={-5} />)

    expect(screen.getByText('-5%')).toBeInTheDocument()
  })

  it('should display custom change label', () => {
    render(
      <MetricsCard
        title="Revenue"
        value="$100"
        change={10}
        changeLabel="vs last month"
      />
    )

    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  it('should render with icon', () => {
    const { container } = render(
      <MetricsCard title="Revenue" value="$100" icon={DollarSign} />
    )

    // Icon should be rendered (lucide-react renders as SVG)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should apply up trend color', () => {
    const { container } = render(
      <MetricsCard title="Revenue" value="$100" change={10} trend="up" />
    )

    const changeElement = screen.getByText('+10%')
    expect(changeElement).toHaveClass('text-green-600')
    expect(changeElement).toHaveClass('bg-green-50')
  })

  it('should apply down trend color', () => {
    const { container } = render(
      <MetricsCard title="Revenue" value="$100" change={-5} trend="down" />
    )

    const changeElement = screen.getByText('-5%')
    expect(changeElement).toHaveClass('text-red-600')
    expect(changeElement).toHaveClass('bg-red-50')
  })

  it('should apply neutral trend color', () => {
    const { container } = render(
      <MetricsCard title="Revenue" value="$100" change={0} trend="neutral" />
    )

    const changeElement = screen.getByText('0%')
    expect(changeElement).toHaveClass('text-gray-600')
    expect(changeElement).toHaveClass('bg-gray-50')
  })

  it('should show loading state', () => {
    render(<MetricsCard title="Revenue" value="$100" loading={true} />)

    // Loading state shows animated skeleton
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()

    // Should not show actual content when loading
    expect(screen.queryByText('Revenue')).not.toBeInTheDocument()
    expect(screen.queryByText('$100')).not.toBeInTheDocument()
  })

  it('should handle missing change gracefully', () => {
    render(<MetricsCard title="Revenue" value="$100" />)

    // Should not display change when not provided
    expect(screen.queryByText('%')).not.toBeInTheDocument()
    expect(screen.queryByText('vs last period')).not.toBeInTheDocument()
  })

  it('should handle zero change', () => {
    render(<MetricsCard title="Revenue" value="$100" change={0} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
