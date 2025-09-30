'use client'

import { useState } from 'react'

export default function TestLinkedInClean() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testLinkedInDirect = () => {
    addLog('🚀 Testing LinkedIn OAuth directly...')

    const clientId = '86de7r9h24e1oe'
    const redirectUri = `${window.location.origin}/api/auth/linkedin-callback`
    const state = `test-${Date.now()}`
    const scope = 'openid profile email'

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`

    addLog(`✅ Client ID: ${clientId}`)
    addLog(`✅ Redirect URI: ${redirectUri}`)
    addLog(`✅ Auth URL: ${authUrl}`)
    addLog('⏳ Redirecting to LinkedIn in 2 seconds...')

    console.log('🔗 LinkedIn OAuth Test (Clean Environment):', {
      clientId,
      redirectUri,
      authUrl,
      state,
      timestamp: new Date().toISOString()
    })

    // Small delay to show logs, then redirect
    setTimeout(() => {
      addLog('🔄 Redirecting now...')
      window.location.href = authUrl
    }, 2000)
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 10px 0'
        }}>
          🔗 LinkedIn OAuth Test - Clean Environment
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0
        }}>
          This page tests LinkedIn OAuth with ZERO Firebase interference.
          <br />
          No Firebase providers, no auth listeners, no Google APIs.
        </p>
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={testLinkedInDirect}
          style={{
            backgroundColor: '#0073b1',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#005885'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0073b1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          🚀 Test LinkedIn OAuth (Clean)
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 15px 0'
        }}>
          🐛 Debug Logs:
        </h3>
        <div style={{
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          {logs.length === 0 ? (
            <p style={{
              color: '#888',
              fontStyle: 'italic',
              margin: 0
            }}>
              💡 No logs yet... Click the button above to start the LinkedIn OAuth test.
            </p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '8px',
                  padding: '4px 0',
                  borderBottom: index < logs.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f5e8',
        border: '1px solid #c3e6c3',
        borderRadius: '8px'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#2d5016',
          margin: 0,
          fontWeight: '500'
        }}>
          ✅ <strong>Environment Status:</strong> This page is completely isolated from Firebase,
          Google APIs, and all other authentication systems. Perfect for clean LinkedIn OAuth testing!
        </p>
      </div>
    </div>
  )
}