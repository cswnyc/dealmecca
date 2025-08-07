import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DebugAdminPage() {
  console.log('🔍 DEBUG ADMIN: Page loading...');
  
  // Get user info from middleware headers
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');
  const userRole = headersList.get('x-user-role');
  
  console.log('🔍 DEBUG ADMIN: Header check result:', {
    hasUserId: !!userId,
    userId: userId,
    email: userEmail,
    role: userRole
  });

  // Check if user should have admin access
  const hasAccess = userId && userRole && (userRole === 'ADMIN' || userRole === 'PRO');
  
  if (!userId || !userRole) {
    console.log('❌ DEBUG ADMIN: No authentication headers - redirecting to login');
    redirect('/auth/signin?callbackUrl=/debug-admin');
  }
  
  if (!hasAccess) {
    console.log('❌ DEBUG ADMIN: No admin access - user role:', userRole);
    redirect('/dashboard');
  }
  
  console.log('✅ DEBUG ADMIN: Access granted');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Admin Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Session Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-green-600">✅ Session Active</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {userId}</div>
            <div><strong>Email:</strong> {userEmail}</div>
            <div><strong>Name:</strong> {userEmail?.split('@')[0] || 'N/A'}</div>
            <div><strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userRole}</span></div>
            <div><strong>Expires:</strong> {session.expires}</div>
          </div>
        </div>
        
        {/* Access Check */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">🔐 Access Check</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Has Session:</strong> <span className="text-green-600">✅ Yes</span></div>
            <div><strong>Role Check:</strong> <span className="text-green-600">✅ {session.user.role} (Allowed)</span></div>
            <div><strong>Admin Access:</strong> <span className="text-green-600">✅ Granted</span></div>
            <div><strong>Layout Check:</strong> <span className="text-green-600">✅ Passed</span></div>
          </div>
        </div>
        
        {/* Test Links */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">🔗 Test Links</h2>
          <div className="space-y-2">
            <a href="/admin" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Admin Dashboard
            </a>
            <a href="/admin/bulk-upload" className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Go to Bulk Upload
            </a>
            <a href="/api/session-debug" target="_blank" className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              View Session Debug API
            </a>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">📝 Next Steps</h2>
          <div className="text-sm space-y-2">
            <p>✅ Your session is working correctly!</p>
            <p>✅ You have the right role for admin access</p>
            <p>✅ This page loaded without redirect</p>
            <p className="font-medium">Try clicking "Go to Admin Dashboard" above.</p>
            <p className="text-gray-600">If that redirects you to login, the issue is in the admin layout specifically.</p>
          </div>
        </div>
        
      </div>
      
      {/* Raw Session Data */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-2">Raw Session Data:</h3>
        <pre className="text-xs overflow-auto bg-white p-4 rounded border">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}