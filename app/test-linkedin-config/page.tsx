'use client'

export default function TestLinkedInConfig() {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">LinkedIn Configuration Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Client ID:</strong> {clientId ? `${clientId.substring(0, 8)}...` : 'NOT FOUND'}</p>
        <p><strong>Status:</strong> {clientId ? '✅ Configured' : '❌ Missing'}</p>
      </div>
    </div>
  )
}