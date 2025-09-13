'use client';

export default function ImportAdmin() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Data Import</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            ⚠️ Data import features are temporarily disabled during deployment migration.
            Import functionality will be restored soon.
          </p>
        </div>
      </div>
    </div>
  );
}