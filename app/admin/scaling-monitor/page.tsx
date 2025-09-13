'use client'

export default function ScalingMonitor() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scaling Monitor</h1>
          <p className="text-gray-600">Monitor system scaling and performance metrics</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">
          ⚠️ Scaling monitor features are temporarily disabled during deployment migration.
          Enhanced scaling monitoring will be restored soon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Connections</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">database connections</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Response Time</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">average response time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Request Rate</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">requests per second</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Error Rate</h3>
          <div className="text-2xl font-bold text-gray-900">Loading...</div>
          <p className="text-sm text-gray-600">error percentage</p>
        </div>
      </div>
    </div>
  )
}