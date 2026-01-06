'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Calendar,
  Upload,
  Shield,
  UserCheck,
  Folder,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Home,
  LogOut,
  BarChart3,
  Briefcase,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Bulk Import',
    href: '/admin/bulk-import',
    icon: Upload,
  },
  {
    title: 'Organizations',
    icon: Building2,
    children: [
      {
        title: 'Companies',
        href: '/admin/orgs/companies',
        icon: Building2,
      },
      {
        title: 'Create Company',
        href: '/admin/orgs/companies/create',
        icon: Building2,
      },
      {
        title: 'Contacts',
        href: '/admin/orgs/contacts',
        icon: Users,
      },
      {
        title: 'Create Contact',
        href: '/admin/orgs/contacts/create',
        icon: Users,
      },
      {
        title: 'Duties',
        href: '/admin/duties',
        icon: Briefcase,
      },
      {
        title: 'Teams',
        href: '/admin/orgs/teams',
        icon: Users,
      },
    ],
  },
  {
    title: 'Forum',
    icon: MessageSquare,
    children: [
      {
        title: 'All Posts',
        href: '/admin/forum/posts',
        icon: MessageSquare,
      },
      {
        title: 'Categories',
        href: '/admin/forum-categories',
        icon: Folder,
      },
    ],
  },
  {
    title: 'Events',
    icon: Calendar,
    children: [
      {
        title: 'All Events',
        href: '/admin/events',
        icon: Calendar,
      },
      {
        title: 'Create Event',
        href: '/admin/events/new',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'User Management',
    icon: UserCheck,
    children: [
      {
        title: 'All Users',
        href: '/admin/users',
        icon: UserCheck,
      },
      {
        title: 'Waitlist',
        href: '/admin/waitlist',
        icon: Shield,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Organizations: true,
    Forum: true,
    Events: true,
    'User Management': true,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('linkedin-session');
      localStorage.removeItem('auth-token');
      await firebaseSignOut(auth);
      router.push('/auth/signup');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-[#E6EAF2] dark:border-[#22304A]">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">Admin Panel</h2>
              <p className="text-xs text-[#64748B] dark:text-[#9AA7C2]">DealMecca</p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-[#64748B] dark:text-[#9AA7C2] hover:text-[#162B54] dark:hover:text-[#EAF0FF]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openSections[item.title];

          if (!hasChildren && item.href) {
            // Simple link
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-gradient-brand-subtle border-l-[3px] border-[#2575FC] dark:border-[#5B8DFF] text-[#2575FC] dark:text-[#5B8DFF] font-medium'
                    : 'text-[#64748B] dark:text-[#9AA7C2] hover:text-[#162B54] dark:hover:text-[#EAF0FF] hover:bg-[#F3F6FB] dark:hover:bg-[#101E38]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-[#2575FC] dark:text-[#5B8DFF]' : ''}`} />
                <span>{item.title}</span>
              </Link>
            );
          }

          // Section with children
          return (
            <div key={item.title}>
              <button
                onClick={() => toggleSection(item.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-[#162B54] dark:text-[#EAF0FF] hover:bg-[#F3F6FB] dark:hover:bg-[#101E38] rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {isOpen && item.children && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#E6EAF2] dark:border-[#22304A] pl-4">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={child.href!}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.href!)
                            ? 'bg-gradient-brand-subtle border-l-[3px] border-[#2575FC] dark:border-[#5B8DFF] text-[#2575FC] dark:text-[#5B8DFF] font-medium'
                            : 'text-[#64748B] dark:text-[#9AA7C2] hover:bg-[#F3F6FB] dark:hover:bg-[#101E38] hover:text-[#162B54] dark:hover:text-[#EAF0FF]'
                        }`}
                      >
                        <ChildIcon className={`w-4 h-4 ${isActive(child.href!) ? 'text-[#2575FC] dark:text-[#5B8DFF]' : ''}`} />
                        <span>{child.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E6EAF2] dark:border-[#22304A] space-y-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center space-x-3 px-3 py-2 text-[#162B54] dark:text-[#EAF0FF] hover:bg-[#F3F6FB] dark:hover:bg-[#101E38] rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Exit Admin</span>
        </Link>
        <div className="px-3 py-2 bg-[#F3F6FB] dark:bg-[#101E38] rounded-lg">
          <p className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
            <span className="font-semibold">22</span> admin pages
          </p>
          <p className="text-xs text-[#64748B] dark:text-[#9AA7C2] mt-1">
            Phase 6 Consolidation Complete
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-[#0F1A2E] rounded-lg shadow-lg border border-[#E6EAF2] dark:border-[#22304A] hover:bg-[#F3F6FB] dark:hover:bg-[#101E38]"
      >
        <Menu className="w-6 h-6 text-[#162B54] dark:text-[#EAF0FF]" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-[#0F1A2E] border-r border-[#E6EAF2] dark:border-[#22304A] z-30">
        <NavContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0F1A2E] border-r border-[#E6EAF2] dark:border-[#22304A] z-50 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <NavContent />
      </aside>
    </>
  );
}
