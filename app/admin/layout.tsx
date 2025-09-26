'use client'

// import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AdminGuard> {/* Disabled for development */}
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">DealMecca Admin</h1>
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">DEV MODE</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/admin" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/admin/orgs/companies" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Companies
                </a>
                <a href="/admin/orgs/contacts" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Contacts
                </a>
                <a href="/admin/forum/posts/moderate" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Moderation
                </a>
                <a href="/admin/events" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Events
                </a>
                <a href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  ← Exit Admin
                </a>
              </nav>
            </div>
          </div>
        </div>
        <main className="py-6">
          {children}
        </main>
      </div>
    // </AdminGuard> {/* Disabled for development */}
  );
}