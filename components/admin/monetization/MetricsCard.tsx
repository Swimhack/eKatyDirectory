import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

export default function MetricsCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  trend,
  loading = false,
}: MetricsCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendBgColor = () => {
    if (trend === 'up') return 'bg-green-50'
    if (trend === 'down') return 'bg-red-50'
    return 'bg-gray-50'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {change !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTrendColor()} ${getTrendBgColor()}`}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="flex-shrink-0">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Icon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
