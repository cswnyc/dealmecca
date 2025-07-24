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
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin');
  }

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