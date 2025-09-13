'use client';

export default function ContactsAdmin() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <a 
            href="/admin/orgs/contacts/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Add Contact
          </a>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            ⚠️ Advanced contact management features are temporarily disabled during deployment migration.
            Enhanced contact administration will be restored soon.
          </p>
        </div>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Total Contacts</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">Loading...</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Verified</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">Loading...</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Pending Review</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-2">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}