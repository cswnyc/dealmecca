'use client'

import { ReactNode } from 'react'
import BackToDashboardButton, { HomeDashboardButton } from './BackToDashboardButton'
import BreadcrumbNavigation from './BreadcrumbNavigation'
import Footer from './Footer'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  showBackButton?: boolean
  showBreadcrumbs?: boolean
  breadcrumbItems?: Array<{ label: string; href: string; current?: boolean }>
  actions?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export default function PageLayout({
  children,
  title,
  description,
  showBackButton = true,
  showBreadcrumbs = true,
  breadcrumbItems,
  actions,
  className,
  headerClassName,
  contentClassName,
  maxWidth = '2xl'
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Header Section */}
      <div className={cn('bg-white border-b border-gray-200', headerClassName)}>
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-4', maxWidthClasses[maxWidth])}>
          {/* Navigation Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <BackToDashboardButton 
                  variant="outline" 
                  size="sm"
                  className="hidden sm:flex"
                />
              )}
              {showBackButton && (
                <HomeDashboardButton 
                  variant="outline" 
                  size="sm"
                  showText={false}
                  className="sm:hidden"
                />
              )}
              {showBreadcrumbs && (
                <BreadcrumbNavigation 
                  items={breadcrumbItems}
                  className="hidden sm:flex"
                />
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>

          {/* Title and Description */}
          {(title || description) && (
            <div className="space-y-2">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-gray-600 text-sm sm:text-base">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className={cn('flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-6', maxWidthClasses[maxWidth])}>
        <div className={cn(contentClassName)}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Specialized layouts for different sections
export function AdminPageLayout(props: Omit<PageLayoutProps, 'breadcrumbItems'> & { 
  currentPage?: string 
}) {
  const { currentPage, ...rest } = props
  
  const breadcrumbItems = [
    { label: 'Administration', href: '/admin' },
    ...(currentPage ? [{ label: currentPage, href: '#', current: true }] : [])
  ]

  return (
    <PageLayout
      {...rest}
      breadcrumbItems={breadcrumbItems}
    />
  )
}

export function OrgsPageLayout(props: Omit<PageLayoutProps, 'breadcrumbItems'> & { 
  currentPage?: string 
}) {
  const { currentPage, ...rest } = props
  
  const breadcrumbItems = [
    { label: 'Organizations', href: '/orgs' },
    ...(currentPage ? [{ label: currentPage, href: '#', current: true }] : [])
  ]

  return (
    <PageLayout
      {...rest}
      breadcrumbItems={breadcrumbItems}
    />
  )
}

export function EventsPageLayout(props: Omit<PageLayoutProps, 'breadcrumbItems'> & { 
  currentPage?: string 
}) {
  const { currentPage, ...rest } = props
  
  const breadcrumbItems = [
    { label: 'Events', href: '/events' },
    ...(currentPage ? [{ label: currentPage, href: '#', current: true }] : [])
  ]

  return (
    <PageLayout
      {...rest}
      breadcrumbItems={breadcrumbItems}
    />
  )
}

export function ForumPageLayout(props: Omit<PageLayoutProps, 'breadcrumbItems'> & { 
  currentPage?: string 
}) {
  const { currentPage, ...rest } = props
  
  const breadcrumbItems = [
    { label: 'Community Forum', href: '/forum' },
    ...(currentPage ? [{ label: currentPage, href: '#', current: true }] : [])
  ]

  return (
    <PageLayout
      {...rest}
      breadcrumbItems={breadcrumbItems}
    />
  )
}

export function DashboardPageLayout(props: Omit<PageLayoutProps, 'breadcrumbItems' | 'showBackButton' | 'showBreadcrumbs'>) {
  return (
    <PageLayout
      {...props}
      showBackButton={false}
      showBreadcrumbs={false}
      className="bg-gradient-to-br from-blue-50 via-white to-teal-50"
    />
  )
} 