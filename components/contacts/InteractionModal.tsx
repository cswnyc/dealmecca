'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, Save, Clock, MessageSquare, Phone, Mail, Users, 
  Calendar, CheckCircle, AlertCircle, MessageCircle
} from 'lucide-react'

interface Interaction {
  id: string
  type: string
  notes?: string
  outcome?: string
  followUpAt?: string
  scheduledAt?: string
  completedAt?: string
  createdAt: string
}

interface InteractionModalProps {
  contactId: string
  contactName: string
  isOpen: boolean
  onClose: () => void
  onInteractionSaved?: () => void
}

const INTERACTION_TYPES = [
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'PHONE_CALL', label: 'Phone Call', icon: Phone },
  { value: 'LINKEDIN_MESSAGE', label: 'LinkedIn Message', icon: MessageCircle },
  { value: 'LINKEDIN_CONNECTION', label: 'LinkedIn Connection', icon: Users },
  { value: 'MEETING', label: 'Meeting', icon: Calendar },
  { value: 'CONFERENCE_CALL', label: 'Conference Call', icon: Phone },
  { value: 'IN_PERSON', label: 'In Person', icon: Users },
  { value: 'OTHER', label: 'Other', icon: MessageSquare }
]

const OUTCOMES = [
  'connected',
  'no_answer',
  'voicemail',
  'interested',
  'not_interested',
  'follow_up',
  'meeting_scheduled',
  'email_bounced',
  'responded',
  'no_response'
]

export default function InteractionModal({
  contactId,
  contactName,
  isOpen,
  onClose,
  onInteractionSaved
}: InteractionModalProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    notes: '',
    outcome: '',
    followUpAt: '',
    scheduledAt: ''
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && contactId) {
      loadInteractions()
    }
  }, [isOpen, contactId])

  const loadInteractions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contacts/${contactId}/interactions`)
      
      if (response.ok) {
        const data = await response.json()
        setInteractions(data.interactions || [])
      } else {
        console.error('Failed to load interactions')
      }
    } catch (error) {
      console.error('Error loading interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveInteraction = async () => {
    if (!formData.type) {
      setError('Interaction type is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/contacts/${contactId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          notes: formData.notes.trim() || undefined,
          outcome: formData.outcome || undefined,
          followUpAt: formData.followUpAt || undefined,
          scheduledAt: formData.scheduledAt || undefined
        })
      })

      if (response.ok) {
        await loadInteractions()
        setShowNewForm(false)
        setFormData({
          type: '',
          notes: '',
          outcome: '',
          followUpAt: '',
          scheduledAt: ''
        })
        if (onInteractionSaved) {
          onInteractionSaved()
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save interaction')
      }
    } catch (error) {
      setError('Failed to save interaction')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInteractionIcon = (type: string) => {
    const interactionType = INTERACTION_TYPES.find(t => t.value === type)
    return interactionType?.icon || MessageSquare
  }

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'connected':
      case 'interested':
      case 'responded':
      case 'meeting_scheduled':
        return 'text-green-600 bg-green-50'
      case 'not_interested':
      case 'email_bounced':
      case 'no_response':
        return 'text-red-600 bg-red-50'
      case 'follow_up':
      case 'no_answer':
      case 'voicemail':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Contact Interactions</h2>
            <p className="text-sm text-gray-600">{contactName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Add New Interaction Button */}
          {!showNewForm && (
            <Button
              onClick={() => setShowNewForm(true)}
              className="w-full mb-6"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Record New Interaction
            </Button>
          )}

          {/* New Interaction Form */}
          {showNewForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-4">Record New Interaction</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Interaction Type *
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interaction type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERACTION_TYPES.map((type) => {
                        const IconComponent = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Outcome
                  </label>
                  <Select
                    value={formData.outcome}
                    onValueChange={(value) => setFormData({ ...formData, outcome: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome..." />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOMES.map((outcome) => (
                        <SelectItem key={outcome} value={outcome}>
                          {outcome.replace(/_/g, ' ').toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add notes about this interaction..."
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Follow-up Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.followUpAt}
                      onChange={(e) => setFormData({ ...formData, followUpAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Scheduled Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewForm(false)
                      setError(null)
                      setFormData({
                        type: '',
                        notes: '',
                        outcome: '',
                        followUpAt: '',
                        scheduledAt: ''
                      })
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveInteraction}
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Interaction
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Interactions List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading interactions...</p>
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No interactions recorded yet</p>
              <p className="text-sm text-gray-500">Record your first interaction to start tracking engagement</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Interaction History ({interactions.length})</h3>
              {interactions.map((interaction) => {
                const IconComponent = getInteractionIcon(interaction.type)
                return (
                  <div
                    key={interaction.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">
                          {INTERACTION_TYPES.find(t => t.value === interaction.type)?.label || interaction.type}
                        </span>
                        {interaction.outcome && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getOutcomeColor(interaction.outcome)}`}
                          >
                            {interaction.outcome.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(interaction.createdAt)}
                      </div>
                    </div>

                    {interaction.notes && (
                      <p className="text-sm text-gray-700 mb-2">{interaction.notes}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {interaction.followUpAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Follow-up: {formatDate(interaction.followUpAt)}
                        </div>
                      )}
                      {interaction.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
