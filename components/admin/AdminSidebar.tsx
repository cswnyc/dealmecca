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
  Calendar,
  MessageSquare
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
    name: 'Bulk Import',
    href: '/admin/bulk-import',
    icon: Upload
  },
  {
    name: 'Companies',
    icon: Building2,
    subItems: [
      {
        name: 'All Companies',
        href: '/admin/orgs/companies',
        icon: Building2
      },
      {
        name: 'Add Company',
        href: '/admin/orgs/companies/create',
        icon: Plus
      },
      {
        name: 'Bulk Upload',
        href: '/admin/bulk-upload',
        icon: Upload
      }
    ]
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
    name: 'Forum',
    icon: MessageSquare,
    subItems: [
      {
        name: 'All Posts',
        href: '/admin/forum/posts',
        icon: MessageSquare
      },
      {
        name: 'Categories',
        href: '/admin/forum-categories',
        icon: FileText
      }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Companies', 'Contacts', 'Events', 'Forum']); // Default expand Companies, Contacts, Events and Forum

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
    <div className="w-64 bg-white shadow-md h-full overflow-y-auto">
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
                    item.name === 'Bulk Import'
                      ? isActive
                        ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      : isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.name === 'Bulk Import' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          New
                        </span>
                      )}
                    </div>
                    {item.name === 'Bulk Import' && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Scale to 5000+ companies
                      </p>
                    )}
                  </div>
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

      {/* Data Scale Progress Widget */}
      <div className="mt-8 mx-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
          Data Scale Target
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Current:</span>
            <span className="font-medium text-gray-900">17 companies</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Goal:</span>
            <span className="font-medium text-green-700">5,000+ companies</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" 
              style={{width: '0.34%'}}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <span className="font-medium text-green-600">Use bulk import</span> to scale rapidly
          </p>
        </div>
      </div>
    </div>
  );
} 