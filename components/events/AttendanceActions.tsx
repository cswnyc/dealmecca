'use client'

import React, { useState } from 'react'
import { Check, Clock, Users, Calendar } from 'lucide-react'

type AttendanceStatus = 'none' | 'interested' | 'planning' | 'registered' | 'attending'

interface AttendanceActionsProps {
  eventId: string
  currentStatus?: AttendanceStatus
  onStatusChange?: (status: AttendanceStatus) => void
}

const statusConfig = {
  none: {
    label: 'Mark Interest',
    icon: Clock,
    color: 'gray',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    textColor: 'text-gray-700',
    description: 'Show interest in this event'
  },
  interested: {
    label: 'Interested',
    icon: Clock,
    color: 'blue',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-700',
    description: 'You\'re interested in this event'
  },
  planning: {
    label: 'Planning to Attend',
    icon: Calendar,
    color: 'yellow',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    textColor: 'text-yellow-700',
    description: 'You\'re planning to attend'
  },
  registered: {
    label: 'Registered',
    icon: Users,
    color: 'green',
    bgColor: 'bg-green-100 hover:bg-green-200',
    textColor: 'text-green-700',
    description: 'You\'re registered for this event'
  },
  attending: {
    label: 'Attending',
    icon: Check,
    color: 'emerald',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200',
    textColor: 'text-emerald-700',
    description: 'You\'re confirmed to attend'
  }
}

const statusFlow: AttendanceStatus[] = ['none', 'interested', 'planning', 'registered', 'attending']

export default function AttendanceActions({ eventId, currentStatus = 'none', onStatusChange }: AttendanceActionsProps) {
  const [status, setStatus] = useState<AttendanceStatus>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: AttendanceStatus) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to update attendance status
      // const response = await fetch(`/api/events/${eventId}/attendance`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStatus(newStatus)
      onStatusChange?.(newStatus)
    } catch (error) {
      console.error('Failed to update attendance status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentIndex = statusFlow.indexOf(status)
  const nextStatus = statusFlow[currentIndex + 1]
  const canAdvance = nextStatus !== undefined

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} ${config.textColor}`}>
          <Icon size={18} />
          <span className="font-medium">{config.label}</span>
        </div>
        <span className="text-sm text-gray-600">{config.description}</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{currentIndex + 1} of {statusFlow.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / statusFlow.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {canAdvance && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                <span>Updating...</span>
              </>
            ) : (
                             <>
                 {React.createElement(statusConfig[nextStatus].icon, { size: 16 })}
                 <span>Move to {statusConfig[nextStatus].label}</span>
               </>
             )}
           </button>
         )}

        {/* Reset Button */}
        {status !== 'none' && (
          <button
            onClick={() => handleStatusUpdate('none')}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        )}
      </div>

      {/* Status Timeline */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Attendance Timeline</h4>
        <div className="space-y-3">
          {statusFlow.map((statusKey, index) => {
            const statusItem = statusConfig[statusKey]
            const StatusIcon = statusItem.icon
            const isActive = index <= currentIndex
            const isCurrent = index === currentIndex
            
            return (
              <div 
                key={statusKey}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isCurrent 
                    ? 'bg-blue-50 border border-blue-200' 
                    : isActive 
                      ? 'bg-green-50' 
                      : 'bg-gray-50'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isActive
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {isActive ? <Check size={16} /> : <StatusIcon size={16} />}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    isCurrent 
                      ? 'text-blue-700' 
                      : isActive 
                        ? 'text-green-700' 
                        : 'text-gray-500'
                  }`}>
                    {statusItem.label}
                  </div>
                  <div className="text-xs text-gray-500">{statusItem.description}</div>
                </div>
                {isCurrent && (
                  <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Current
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 