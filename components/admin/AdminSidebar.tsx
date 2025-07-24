'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Building2, 
  Users, 
  Shield, 
  BarChart3, 
  Settings,
  Database,
  ChevronDown,
  ChevronRight,
  Plus,
  Upload,
  FileText,
  Calendar
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3
  },
  {
    name: 'Companies',
    href: '/admin/orgs/companies',
    icon: Building2
  },
  {
    name: 'Contacts',
    icon: Users,
    subItems: [
      {
        name: 'All Contacts',
        href: '/admin/orgs/contacts',
        icon: Users
      },
      {
        name: 'Add Contact',
        href: '/admin/orgs/contacts/create',
        icon: Plus
      },
      {
        name: 'Import Contacts',
        href: '/admin/orgs/contacts/import',
        icon: Upload
      }
    ]
  },
  {
    name: 'Events',
    icon: Calendar,
    subItems: [
      {
        name: 'All Events',
        href: '/admin/events',
        icon: Calendar
      },
      {
        name: 'Create Event',
        href: '/admin/events/new',
        icon: Plus
      }
    ]
  },
  {
    name: 'Verification Queue',
    href: '/admin/orgs/verification',
    icon: Shield
  },
  {
    name: 'Data Import',
    href: '/admin/orgs/import',
    icon: Database
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Contacts', 'Events']); // Default expand Contacts and Events

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavigationItem) => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => pathname === subItem.href);
    }
    return false;
  };

  const isSubItemActive = (subItem: SubMenuItem) => {
    return pathname === subItem.href;
  };

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Organization Management</p>
      </div>
      <nav className="mt-6">
        {navigationItems.map((item) => {
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.name);
          const Icon = item.icon;
          
          return (
            <div key={item.name}>
              {/* Main Item */}
              {item.subItems ? (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )}

              {/* Sub Items */}
              {item.subItems && isExpanded && (
                <div className="bg-gray-50">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = isSubItemActive(subItem);
                    
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center px-12 py-2.5 text-sm transition-colors ${
                          isSubActive
                            ? 'bg-blue-100 text-blue-700 font-medium border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {SubIcon && <SubIcon className="mr-2 h-4 w-4" />}
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
} 