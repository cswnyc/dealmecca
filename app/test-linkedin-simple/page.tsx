'use client'

import { useState } from 'react'

export default function TestLinkedInSimple() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testLinkedInDirect = () => {
    addLog('Testing LinkedIn OAuth directly...')

    const clientId = '86de7r9h24e1oe'
    const redirectUri = `${window.location.origin}/api/auth/linkedin-callback`
    const state = `test-${Date.now()}`
    const scope = 'openid profile email'

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`

    addLog(`Redirect URI: ${redirectUri}`)
    addLog(`Auth URL: ${authUrl}`)

    // Redirect to LinkedIn
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">LinkedIn OAuth Simple Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Direct LinkedIn Test</h2>
          <button
            onClick={testLinkedInDirect}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Test LinkedIn OAuth (Direct)
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="font-mono text-sm mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}