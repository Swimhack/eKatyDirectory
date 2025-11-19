import Link from 'next/link'
import { Mail, Clock, Eye, MousePointer, Calendar } from 'lucide-react'

interface OutreachCampaign {
  id: string
  name: string
  status: string
  total_sent: number
  total_opened: number
  total_clicked: number
  sent_at?: string
  scheduled_for?: string
  created_at: string
}

interface OutreachTableProps {
  campaigns: OutreachCampaign[]
}

export default function OutreachTable({ campaigns }: OutreachTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'sending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateOpenRate = (sent: number, opened: number) => {
    if (sent === 0) return '0%'
    return `${Math.round((opened / sent) * 100)}%`
  }

  const calculateClickRate = (sent: number, clicked: number) => {
    if (sent === 0) return '0%'
    return `${Math.round((clicked / sent) * 100)}%`
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No campaigns found</p>
        <Link
          href="/admin/monetization/outreach/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Create Your First Campaign
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Open Rate
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Click Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {campaign.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {campaign.total_sent || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {campaign.total_opened || 0}
                    </span>
                    <span className="text-xs text-gray-500">
                      (
                      {calculateOpenRate(
                        campaign.total_sent || 0,
                        campaign.total_opened || 0
                      )}
                      )
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <MousePointer className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {campaign.total_clicked || 0}
                    </span>
                    <span className="text-xs text-gray-500">
                      (
                      {calculateClickRate(
                        campaign.total_sent || 0,
                        campaign.total_clicked || 0
                      )}
                      )
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {campaign.sent_at ? (
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(campaign.sent_at).toLocaleDateString()}
                    </div>
                  ) : campaign.scheduled_for ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(campaign.scheduled_for).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Not scheduled</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/monetization/outreach/${campaign.id}`}
                    className="text-brand-600 hover:text-brand-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
