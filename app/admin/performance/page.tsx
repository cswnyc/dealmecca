'use client'

export default function PerformanceDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor system performance and database metrics</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">
          ⚠️ Performance monitoring features are temporarily disabled during deployment migration.
          Enhanced performance dashboard will be restored soon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Database Queries</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">queries executed</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">API Performance</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">API calls</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Memory Usage</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">heap used</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">System Alerts</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">active alerts</p>
        </div>
      </div>
    </div>
  )
}