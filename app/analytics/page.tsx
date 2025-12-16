'use client'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              ⚠️ Analytics features are temporarily disabled during deployment migration.
              Enhanced analytics dashboard will be restored soon.
            </p>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground">Search Analytics</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">Loading...</p>
              </div>
              <div className="bg-muted p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground">User Activity</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">Loading...</p>
              </div>
              <div className="bg-muted p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground">Growth Metrics</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}