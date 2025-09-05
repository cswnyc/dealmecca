'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface BackToDashboardButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  showText?: boolean
  customText?: string
}

export default function BackToDashboardButton({
  variant = 'outline',
  size = 'default',
  className,
  showIcon = true,
  showText = true,
  customText = 'Back to Forum'
}: BackToDashboardButtonProps) {
  const router = useRouter()

  const handleBackToDashboard = () => {
    window.location.href = '/forum'
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBackToDashboard}
      className={cn(
        'flex items-center space-x-2 transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      {showText && <span>{customText}</span>}
    </Button>
  )
}

// Alternative version with Home icon
export function HomeDashboardButton({
  variant = 'outline',
  size = 'default',
  className,
  showIcon = true,
  showText = true,
  customText = 'Forum'
}: BackToDashboardButtonProps) {
  const router = useRouter()

  const handleGoToDashboard = () => {
    window.location.href = '/forum'
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoToDashboard}
      className={cn(
        'flex items-center space-x-2 transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      {showIcon && <Home className="w-4 h-4" />}
      {showText && <span>{customText}</span>}
    </Button>
  )
} 