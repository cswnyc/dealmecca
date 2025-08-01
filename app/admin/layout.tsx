import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔵 ADMIN LAYOUT: Starting session check...');
  
  const session = await getServerSession(authOptions);
  
  console.log('🔵 ADMIN LAYOUT: Session result:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    role: session?.user?.role,
    expires: session?.expires
  });

  // Check if user is admin (temporarily allow PRO users)
  if (!session) {
    console.log('❌ ADMIN LAYOUT: No session found - redirecting to login');
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'PRO') {
    console.log('❌ ADMIN LAYOUT: Insufficient role:', session.user.role, '- redirecting to login');
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  console.log('✅ ADMIN LAYOUT: Access granted for role:', session.user.role);

  // Convert user object to match AdminHeader expected types
  const user = {
    id: session.user.id,
    name: session.user.name || undefined,
    email: session.user.email || undefined,
    role: session.user.role,
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