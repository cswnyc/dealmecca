'use client'

import { AdminSidebar } from '@/components/admin/AdminSidebar';
// import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AdminGuard> {/* Disabled for development */}
      <div className="min-h-screen bg-muted">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    // </AdminGuard> {/* Disabled for development */}
  );
}