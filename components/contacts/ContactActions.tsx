'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, Phone, MessageSquare, Calendar, Star, Award,
  ExternalLink, Plus, Edit, Clock, CheckCircle, AlertCircle
} from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  fullName?: string
  title: string
  email?: string
  phone?: string
  linkedinUrl?: string
  isDecisionMaker: boolean
  verified: boolean
  seniority?: string
  department?: string
  company: {
    id: string
    name: string
    companyType?: string
    industry?: string
    city?: string
    state?: string
    verified: boolean
  }
}

interface ContactActionsProps {
  contact: Contact
  onInteraction?: (type: string, data: any) => void
  onAddNote?: () => void
  onScheduleFollowUp?: () => void
  compact?: boolean
}

export default function ContactActions({
  contact,
  onInteraction,
  onAddNote,
  onScheduleFollowUp,
  compact = false
}: ContactActionsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleEmailAction = async () => {
    if (!contact.email) return

    setActionLoading('email')
    
    try {
      // Record interaction
      if (onInteraction) {
        await onInteraction('EMAIL', {
          type: 'EMAIL',
          notes: `Email sent to ${contact.email}`,
          outcome: 'sent'
        })
      }

      // Open email client
      const subject = `Re: Media Services - ${contact.company.name}`
      const body = `Hi ${contact.firstName},\n\nI hope this email finds you well. I wanted to reach out regarding our media services that could benefit ${contact.company.name}.\n\nWould you be available for a brief call to discuss how we can help optimize your media strategy?\n\nBest regards`
      
      window.open(`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    } catch (error) {
      console.error('Email action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePhoneAction = async () => {
    if (!contact.phone) return

    setActionLoading('phone')
    
    try {
      // Record interaction intent
      if (onInteraction) {
        await onInteraction('PHONE_CALL', {
          type: 'PHONE_CALL',
          notes: `Phone call initiated to ${contact.phone}`,
          scheduledAt: new Date()
        })
      }

      // Open phone app
      window.open(`tel:${contact.phone}`)
    } catch (error) {
      console.error('Phone action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleLinkedInAction = async () => {
    if (!contact.linkedinUrl) return

    setActionLoading('linkedin')
    
    try {
      // Record interaction
      if (onInteraction) {
        await onInteraction('LINKEDIN_MESSAGE', {
          type: 'LINKEDIN_MESSAGE',
          notes: `LinkedIn profile visited: ${contact.linkedinUrl}`,
          outcome: 'visited'
        })
      }

      // Open LinkedIn profile
      window.open(contact.linkedinUrl, '_blank')
    } catch (error) {
      console.error('LinkedIn action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const displayName = contact.fullName || `${contact.firstName} ${contact.lastName}`

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        {contact.email && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleEmailAction}
            disabled={actionLoading === 'email'}
            title={`Email ${contact.email}`}
          >
            {actionLoading === 'email' ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {contact.phone && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handlePhoneAction}
            disabled={actionLoading === 'phone'}
            title={`Call ${contact.phone}`}
          >
            {actionLoading === 'phone' ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
            ) : (
              <Phone className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {contact.linkedinUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleLinkedInAction}
            disabled={actionLoading === 'linkedin'}
            title="View LinkedIn Profile"
          >
            {actionLoading === 'linkedin' ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Contact Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
          <p className="text-sm text-gray-600">
            {contact.title} • {contact.company.name}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {contact.seniority && (
              <Badge variant="outline" className="text-xs">
                {contact.seniority.replace(/_/g, ' ')}
              </Badge>
            )}
            {contact.department && (
              <Badge variant="outline" className="text-xs">
                {contact.department.replace(/_/g, ' ')}
              </Badge>
            )}
            {contact.company.city && contact.company.state && (
              <Badge variant="outline" className="text-xs">
                {contact.company.city}, {contact.company.state}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contact.isDecisionMaker && (
            <Badge variant="default" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              Decision Maker
            </Badge>
          )}
          {contact.verified && (
            <Badge variant="secondary" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {contact.email && (
          <Button
            onClick={handleEmailAction}
            disabled={actionLoading === 'email'}
            className="flex items-center justify-center gap-2"
          >
            {actionLoading === 'email' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Email
          </Button>
        )}
        
        {contact.phone && (
          <Button
            variant="outline"
            onClick={handlePhoneAction}
            disabled={actionLoading === 'phone'}
            className="flex items-center justify-center gap-2"
          >
            {actionLoading === 'phone' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <Phone className="h-4 w-4" />
            )}
            Call Now
          </Button>
        )}
        
        {contact.linkedinUrl && (
          <Button
            variant="outline"
            onClick={handleLinkedInAction}
            disabled={actionLoading === 'linkedin'}
            className="flex items-center justify-center gap-2"
          >
            {actionLoading === 'linkedin' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            LinkedIn
          </Button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddNote}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Note
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onScheduleFollowUp}
          className="flex items-center gap-1"
        >
          <Calendar className="h-3 w-3" />
          Schedule Follow-up
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
        >
          <Edit className="h-3 w-3" />
          Edit Contact
        </Button>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
        <div className="space-y-1 text-sm">
          {contact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{contact.phone}</span>
            </div>
          )}
          {contact.linkedinUrl && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">LinkedIn Profile</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Status Indicators */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Contact available</span>
        </div>
        {!contact.email && !contact.phone && (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-yellow-500" />
            <span>Limited contact options</span>
          </div>
        )}
      </div>
    </div>
  )
}
