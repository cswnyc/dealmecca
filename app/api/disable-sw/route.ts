import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Return client-side script to unregister service worker
    const unregisterScript = `
      <html>
        <head><title>Service Worker Control</title></head>
        <body>
          <h1>Service Worker Management</h1>
          <div id="status">Checking service worker status...</div>
          
          <script>
            async function checkServiceWorker() {
              const statusDiv = document.getElementById('status');
              
              if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                
                if (registrations.length > 0) {
                  statusDiv.innerHTML = \`
                    <p><strong>Service Workers Found:</strong> \${registrations.length}</p>
                    <button onclick="unregisterAll()">Unregister All Service Workers</button>
                    <button onclick="window.location.reload()">Refresh Page</button>
                    <br><br>
                    <strong>Registrations:</strong><br>
                    \${registrations.map(reg => \`<div>Scope: \${reg.scope}</div>\`).join('')}
                  \`;
                } else {
                  statusDiv.innerHTML = '<p><strong>No service workers registered</strong></p>';
                }
              } else {
                statusDiv.innerHTML = '<p>Service workers not supported</p>';
              }
            }
            
            async function unregisterAll() {
              if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                
                for (let registration of registrations) {
                  await registration.unregister();
                  console.log('Service worker unregistered:', registration.scope);
                }
                
                alert('All service workers unregistered! Please refresh the page.');
                window.location.reload();
              }
            }
            
            // Check status when page loads
            checkServiceWorker();
          </script>
          
          <hr>
          <h2>Quick Actions</h2>
          <p><a href="/login">Go to Login Page</a></p>
          <p><a href="/dashboard">Go to Dashboard</a></p>
          <p><a href="/api/debug-session">Check Session Status</a></p>
          
          <hr>
          <p><small>Use this page to debug service worker interference with authentication.</small></p>
        </body>
      </html>
    `;

    return new NextResponse(unregisterScript, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
    
  } catch (error: any) {
    console.error('❌ Service worker disable error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Same as POST for convenience
  return POST(request)
} 