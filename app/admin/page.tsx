'use client';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            ⚠️ Advanced admin dashboard features are temporarily disabled during deployment migration.
            Enhanced admin functionality will be restored soon.
          </p>
        </div>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Total Companies</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">Loading...</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Total Contacts</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">Loading...</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Active Users</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">Loading...</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/admin/orgs/companies" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">Manage Companies</h3>
              <p className="text-sm text-gray-600 mt-1">View and edit company data</p>
            </a>
            <a href="/admin/orgs/contacts" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">Manage Contacts</h3>
              <p className="text-sm text-gray-600 mt-1">View and edit contact data</p>
            </a>
            <a href="/admin/forum/posts" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">Forum Posts</h3>
              <p className="text-sm text-gray-600 mt-1">Moderate forum content</p>
            </a>
            <a href="/admin/performance" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">Performance</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor system performance</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}