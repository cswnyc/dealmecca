'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1220]">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}