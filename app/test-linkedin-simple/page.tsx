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
    addLog('Redirecting to LinkedIn in 2 seconds...')

    console.log('LinkedIn OAuth Test:', {
      clientId,
      redirectUri,
      authUrl,
      state
    })

    // Small delay to show logs, then redirect
    setTimeout(() => {
      window.location.href = authUrl
    }, 2000)
  }

  return (
    <html>
      <head>
        <title>LinkedIn OAuth Test</title>
        <style>{`
          /* Hide any injected layout elements */
          * {
            position: relative !important;
          }

          /* Hide potential navigation elements */
          nav, header, .nav, .navbar, .header, .user-profile, .auth-button,
          button:not(.button), [class*="user"], [class*="User"], [class*="auth"],
          [class*="profile"], [class*="signin"], [class*="login"] {
            display: none !important;
            visibility: hidden !important;
          }

          body {
            font-family: Arial, sans-serif !important;
            margin: 0 !important;
            padding: 20px !important;
            background-color: #f5f5f5 !important;
            overflow-x: hidden !important;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .button {
            background: #0073b1;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 0;
          }
          .button:hover {
            background: #005885;
          }
          .logs {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🔗 LinkedIn OAuth Test (Isolated)</h1>
          <p>This page tests LinkedIn OAuth without any layout or navigation interference.</p>

          <button
            onClick={testLinkedInDirect}
            className="button"
          >
            🚀 Test LinkedIn OAuth (Direct)
          </button>

          <div className="logs">
            <h3>Debug Logs:</h3>
            {logs.length === 0 ? (
              <p>No logs yet... Click the button to start test.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </body>
    </html>
  )
}