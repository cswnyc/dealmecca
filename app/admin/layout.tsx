import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔵 ADMIN LAYOUT: Starting session check...');
  
  // Get user info from middleware headers (which successfully decodes our JWT)
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');
  const userRole = headersList.get('x-user-role');
  const userTier = headersList.get('x-user-tier');
  
  console.log('🔵 ADMIN LAYOUT: Headers result:', {
    hasUserId: !!userId,
    userId: userId,
    email: userEmail,
    role: userRole,
    tier: userTier
  });

  // Check if user is authenticated via middleware
  if (!userId || !userRole) {
    console.log('❌ ADMIN LAYOUT: No authentication headers found - redirecting to login');
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  if (userRole !== 'ADMIN' && userRole !== 'PRO') {
    console.log('❌ ADMIN LAYOUT: Insufficient role:', userRole, '- redirecting to login');
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  console.log('✅ ADMIN LAYOUT: Access granted for role:', userRole);

  // Convert header values to user object
  const user = {
    id: userId,
    name: userEmail?.split('@')[0] || undefined, // Extract name from email
    email: userEmail || undefined,
    role: userRole,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 