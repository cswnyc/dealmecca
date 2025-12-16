'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  X, Star, Award, MapPin, Building2, Mail, Phone, ExternalLink,
  MessageSquare, Calendar, Plus, Edit, Clock, User, ChevronDown,
  ChevronUp, Save, ArrowLeft, Share, Heart, MoreHorizontal
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

interface MobileContactModalProps {
  contact: Contact
  isOpen: boolean
  onClose: () => void
  onInteraction?: (type: string, data: any) => void
  onAddNote?: (note: string) => void
  onScheduleFollowUp?: (date: string) => void
}

export default function MobileContactModal({
  contact,
  isOpen,
  onClose,
  onInteraction,
  onAddNote,
  onScheduleFollowUp
}: MobileContactModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'activity'>('details')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const modalRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)

  const displayName = contact.fullName || `${contact.firstName} ${contact.lastName}`

  // Handle modal backdrop and escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose])

  // Touch handlers for pull-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === modalRef.current || modalRef.current?.contains(e.target as Node)) {
      setIsDragging(true)
      dragStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - dragStartY.current
    
    // Only allow downward drag
    if (diff > 0) {
      setDragY(diff)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Close modal if dragged down more than 150px
    if (dragY > 150) {
      onClose()
    }
    
    setDragY(0)
  }

  const handleEmailAction = async () => {
    if (!contact.email) return

    setActionLoading('email')
    
    try {
      if (onInteraction) {
        await onInteraction('EMAIL', {
          type: 'EMAIL',
          notes: `Email sent to ${contact.email}`,
          outcome: 'sent'
        })
      }

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
      if (onInteraction) {
        await onInteraction('PHONE_CALL', {
          type: 'PHONE_CALL',
          notes: `Phone call initiated to ${contact.phone}`,
          scheduledAt: new Date()
        })
      }

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
      if (onInteraction) {
        await onInteraction('LINKEDIN_MESSAGE', {
          type: 'LINKEDIN_MESSAGE',
          notes: `LinkedIn profile visited: ${contact.linkedinUrl}`,
          outcome: 'visited'
        })
      }

      window.open(contact.linkedinUrl, '_blank')
    } catch (error) {
      console.error('LinkedIn action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return
    
    try {
      if (onAddNote) {
        await onAddNote(noteText.trim())
      }
      setNoteText('')
      setShowNoteForm(false)
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleScheduleFollowUp = async () => {
    if (!followUpDate) return
    
    try {
      if (onScheduleFollowUp) {
        await onScheduleFollowUp(followUpDate)
      }
      setFollowUpDate('')
      setShowFollowUpForm(false)
    } catch (error) {
      console.error('Failed to schedule follow-up:', error)
    }
  }

  if (!isOpen) return null

  const modalTransform = isDragging 
    ? `translateY(${Math.min(dragY, 300)}px)` 
    : 'translateY(0px)'

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      {/* Modal */}
      <div 
        ref={modalRef}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[95vh] overflow-hidden"
        style={{
          transform: modalTransform,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <Share className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            <p className="text-muted-foreground mt-1">{contact.title}</p>
            <p className="text-muted-foreground text-sm">{contact.company.name}</p>
            
            <div className="flex items-center justify-center gap-2 mt-3">
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
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-muted">
          <div className="grid grid-cols-3 gap-4">
            {contact.email && (
              <Button
                onClick={handleEmailAction}
                disabled={actionLoading === 'email'}
                className="h-16 flex flex-col items-center gap-1 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                {actionLoading === 'email' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                <span className="text-xs">Email</span>
              </Button>
            )}

            {contact.phone && (
              <Button
                onClick={handlePhoneAction}
                disabled={actionLoading === 'phone'}
                className="h-16 flex flex-col items-center gap-1 bg-primary hover:bg-primary/90 rounded-xl"
              >
                {actionLoading === 'phone' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
                <span className="text-xs">Call</span>
              </Button>
            )}

            {contact.linkedinUrl && (
              <Button
                onClick={handleLinkedInAction}
                disabled={actionLoading === 'linkedin'}
                className="h-16 flex flex-col items-center gap-1 bg-accent hover:bg-accent/90 rounded-xl"
              >
                {actionLoading === 'linkedin' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <ExternalLink className="w-5 h-5" />
                )}
                <span className="text-xs">LinkedIn</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-border">
          <div className="flex">
            {(['details', 'notes', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 300px)' }}>
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{contact.phone}</span>
                    </div>
                  )}
                  {contact.linkedinUrl && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      <span className="text-primary">LinkedIn Profile</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Company Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{contact.company.name}</div>
                      {contact.company.industry && (
                        <div className="text-sm text-muted-foreground">{contact.company.industry.replace(/_/g, ' ')}</div>
                      )}
                    </div>
                  </div>

                  {contact.company.city && contact.company.state && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{contact.company.city}, {contact.company.state}</span>
                    </div>
                  )}

                  {contact.seniority && (
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{contact.seniority.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                <Button
                  size="sm"
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>

              {showNoteForm && (
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note about this contact..."
                    className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    style={{ fontSize: '16px' }} // Prevent zoom on iOS
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNoteForm(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={!noteText.trim()}
                      className="rounded-xl"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save Note
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No notes yet</p>
                <p className="text-sm">Add your first note to start tracking interactions</p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Activity</h3>
                <Button
                  size="sm"
                  onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                  className="rounded-full"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Follow-up
                </Button>
              </div>

              {showFollowUpForm && (
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Schedule Follow-up
                  </label>
                  <Input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFollowUpForm(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleScheduleFollowUp}
                      disabled={!followUpDate}
                      className="rounded-xl"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No activity yet</p>
                <p className="text-sm">Interactions will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
