'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[]
  className?: string
  showHomeIcon?: boolean
  homeHref?: string
  separator?: React.ReactNode
}

export default function BreadcrumbNavigation({
  items,
  className,
  showHomeIcon = true,
  homeHref = '/dashboard',
  separator
}: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if no items provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  const defaultSeparator = separator || <ChevronRight className="w-4 h-4 text-gray-400" />

  return (
    <nav
      className={cn(
        'flex items-center space-x-2 text-sm text-gray-600',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {/* Home/Dashboard link */}
        <li>
          <Link
            href={homeHref}
            className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
          >
            {showHomeIcon && <Home className="w-4 h-4" />}
            <span>Dashboard</span>
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => (
          <Fragment key={item.href}>
            <li className="flex items-center space-x-2">
              {defaultSeparator}
              {item.current ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Format segment label
    const label = formatSegmentLabel(segment)

    items.push({
      label,
      href: currentPath,
      current: isLast
    })
  })

  return items
}

// Helper function to format segment labels
function formatSegmentLabel(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'orgs': 'Organizations',
    'admin': 'Administration',
    'companies': 'Companies',
    'contacts': 'Contacts',
    'events': 'Events',
    'forum': 'Community Forum',
    'search': 'Search',
    'analytics': 'Analytics',
    'settings': 'Settings',
    'profile': 'Profile',
    'create': 'Create New',
    'edit': 'Edit',
    'view': 'View Details'
  }

  if (specialCases[segment]) {
    return specialCases[segment]
  }

  // Check if it's an ID (starts with numbers or common ID patterns)
  if (/^[0-9a-f-]{8,}/.test(segment) || /^\d+$/.test(segment)) {
    return `ID: ${segment.slice(0, 8)}...`
  }

  // Default: capitalize and replace hyphens/underscores with spaces
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Pre-configured breadcrumb components for common sections
export function AdminBreadcrumbs({ currentPage }: { currentPage?: string }) {
  const items: BreadcrumbItem[] = [
    { label: 'Administration', href: '/admin' }
  ]

  if (currentPage) {
    items.push({
      label: currentPage,
      href: '#',
      current: true
    })
  }

  return <BreadcrumbNavigation items={items} />
}

export function OrgsBreadcrumbs({ currentPage }: { currentPage?: string }) {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/orgs' }
  ]

  if (currentPage) {
    items.push({
      label: currentPage,
      href: '#',
      current: true
    })
  }

  return <BreadcrumbNavigation items={items} />
}

export function EventsBreadcrumbs({ currentPage }: { currentPage?: string }) {
  const items: BreadcrumbItem[] = [
    { label: 'Events', href: '/events' }
  ]

  if (currentPage) {
    items.push({
      label: currentPage,
      href: '#',
      current: true
    })
  }

  return <BreadcrumbNavigation items={items} />
}

export function ForumBreadcrumbs({ currentPage }: { currentPage?: string }) {
  const items: BreadcrumbItem[] = [
    { label: 'Community Forum', href: '/forum' }
  ]

  if (currentPage) {
    items.push({
      label: currentPage,
      href: '#',
      current: true
    })
  }

  return <BreadcrumbNavigation items={items} />
} 