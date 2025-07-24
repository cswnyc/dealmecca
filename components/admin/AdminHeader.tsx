'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
  user: {
    id: string;
    name?: string;
    email?: string;
    role: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">DealMecca Admin</h1>
            <p className="text-sm text-gray-500">Organization Data Management</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name || 'Admin User'}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 