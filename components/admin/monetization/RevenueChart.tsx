'use client'

interface RevenueDataPoint {
  month: string
  mrr: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No revenue data available</p>
      </div>
    )
  }

  // Calculate dimensions and scaling
  const width = 100 // percentage
  const height = 300
  const padding = { top: 20, right: 30, bottom: 40, left: 60 }
  const chartWidth = 100 - (padding.left + padding.right) / 10
  const chartHeight = height - padding.top - padding.bottom

  // Calculate min and max values for scaling
  const mrrValues = data.map((d) => d.mrr)
  const maxMrr = Math.max(...mrrValues)
  const minMrr = Math.min(...mrrValues, 0)
  const mrrRange = maxMrr - minMrr || 1

  // Generate Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = minMrr + (mrrRange * (4 - i)) / 4
    return Math.round(value)
  })

  // Calculate path for line chart
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * chartWidth
    const y = ((maxMrr - point.mrr) / mrrRange) * chartHeight
    return { x, y, ...point }
  })

  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${point.x}% ${point.y + padding.top}`
    })
    .join(' ')

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Recurring Revenue Trend
      </h3>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height={height}
          className="overflow-visible"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {yTicks.map((tick, index) => {
            const y = padding.top + (chartHeight * index) / 4
            return (
              <g key={`grid-${index}`}>
                <line
                  x1={`${padding.left / 10}%`}
                  y1={y}
                  x2={`${100 - padding.right / 10}%`}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )
          })}

          {/* Line chart */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={`${point.x}%`}
                cy={point.y + padding.top}
                r="5"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer hover:r-6 transition-all"
              >
                <title>
                  {point.month}: {formatCurrency(point.mrr)}
                </title>
              </circle>
            </g>
          ))}
        </svg>

        {/* Y-axis labels */}
        <div
          className="absolute left-0 top-0 flex flex-col justify-between"
          style={{ height: `${height}px`, width: `${padding.left}px` }}
        >
          {yTicks.map((tick, index) => (
            <div
              key={`y-label-${index}`}
              className="text-xs text-gray-600 text-right pr-2"
              style={{ height: '1px' }}
            >
              {formatCurrency(tick)}
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div
          className="absolute bottom-0 left-0 right-0 flex justify-between"
          style={{
            paddingLeft: `${padding.left}px`,
            paddingRight: `${padding.right}px`,
            paddingTop: '8px',
          }}
        >
          {data.map((point, index) => (
            <div
              key={`x-label-${index}`}
              className="text-xs text-gray-600 text-center"
            >
              {point.month}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
      </div>
    </div>
  )
}
