'use client';

import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  user?: {
    id: string;
    name?: string;
    email?: string;
    role: string;
  };
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function AdminHeader({ user, title, subtitle, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/auth/firebase-signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                {title || 'DealMecca Admin'}
              </h1>
              <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                {subtitle || 'Organization Data Management'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name || 'Admin User'}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </div>
                
                {/* Mobile user avatar */}
                <div className="h-8 w-8 bg-blue-600 text-white flex items-center justify-center rounded-full sm:hidden">
                  <User className="h-4 w-4" />
                </div>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 