'use client';

export default function EditCompany() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Edit Company</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            ⚠️ Company editing features are temporarily disabled during deployment migration.
            Advanced editing functionality will be restored soon.
          </p>
        </div>
        <div className="mt-6">
          <a 
            href="/admin/orgs/companies" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to Companies
          </a>
        </div>
      </div>
    </div>
  );
}