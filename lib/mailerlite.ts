/**
 * MailerLite API Integration
 *
 * This service handles all MailerLite operations including:
 * - Subscriber management
 * - Group management
 * - Custom field updates
 */

const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api'

interface MailerLiteSubscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk'
  source: string
  sent: number
  opens_count: number
  clicks_count: number
  open_rate: number
  click_rate: number
  ip_address: string | null
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
  fields: Record<string, any>
  groups: Array<{
    id: string
    name: string
  }>
}

interface MailerLiteGroup {
  id: string
  name: string
  active_count: number
  sent_count: number
  opens_count: number
  open_rate: {
    float: number
    string: string
  }
  clicks_count: number
  click_rate: {
    float: number
    string: string
  }
  unsubscribed_count: number
  unconfirmed_count: number
  bounced_count: number
  junk_count: number
  created_at: string
}

interface SubscribeOptions {
  fields?: Record<string, any>
  groups?: string[] // Array of group IDs
  status?: 'active' | 'unsubscribed' | 'unconfirmed'
  resubscribe?: boolean
}

class MailerLiteService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.MAILERLITE_API_KEY || ''

    if (!this.apiKey) {
      console.warn('MailerLite API key not configured')
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error('MailerLite API key not configured')
    }

    const url = `${MAILERLITE_API_BASE}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`MailerLite API error: ${response.status} ${error}`)
    }

    // Some endpoints return 204 No Content
    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  /**
   * Subscribe a user to MailerLite
   */
  async subscribe(email: string, options: SubscribeOptions = {}): Promise<MailerLiteSubscriber> {
    const { fields, groups, status = 'active', resubscribe = true } = options

    const payload: any = {
      email,
      status,
    }

    if (fields) {
      payload.fields = fields
    }

    if (groups && groups.length > 0) {
      payload.groups = groups
    }

    if (resubscribe) {
      payload.resubscribe = true
    }

    const result = await this.makeRequest('/subscribers', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return result.data
  }

  /**
   * Get subscriber by email
   */
  async getSubscriber(email: string): Promise<MailerLiteSubscriber | null> {
    try {
      const result = await this.makeRequest(`/subscribers/${encodeURIComponent(email)}`)
      return result.data
    } catch (error: any) {
      // Return null if subscriber not found
      if (error.message.includes('404')) {
        return null
      }
      console.error('Error fetching subscriber:', error)
      throw error
    }
  }

  /**
   * Update subscriber information
   */
  async updateSubscriber(subscriberId: string, updates: Partial<MailerLiteSubscriber>): Promise<MailerLiteSubscriber> {
    const result = await this.makeRequest(`/subscribers/${subscriberId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
    return result.data
  }

  /**
   * Update subscriber fields
   */
  async updateSubscriberFields(email: string, fields: Record<string, any>): Promise<MailerLiteSubscriber> {
    const result = await this.makeRequest(`/subscribers/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify({ fields })
    })
    return result.data
  }

  /**
   * Add subscriber to a group
   */
  async addToGroup(subscriberId: string, groupId: string): Promise<void> {
    await this.makeRequest(`/subscribers/${subscriberId}/groups/${groupId}`, {
      method: 'POST'
    })
  }

  /**
   * Remove subscriber from a group
   */
  async removeFromGroup(subscriberId: string, groupId: string): Promise<void> {
    await this.makeRequest(`/subscribers/${subscriberId}/groups/${groupId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get all groups
   */
  async getGroups(): Promise<MailerLiteGroup[]> {
    const result = await this.makeRequest('/groups')
    return result.data || []
  }

  /**
   * Create a new group
   */
  async createGroup(name: string): Promise<MailerLiteGroup> {
    const result = await this.makeRequest('/groups', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
    return result.data
  }

  /**
   * Unsubscribe a user
   */
  async unsubscribe(email: string): Promise<void> {
    await this.makeRequest(`/subscribers/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'unsubscribed' })
    })
  }

  /**
   * Delete a subscriber permanently
   */
  async deleteSubscriber(subscriberId: string): Promise<void> {
    await this.makeRequest(`/subscribers/${subscriberId}`, {
      method: 'DELETE'
    })
  }
}

// Create singleton instance
export const mailerLite = new MailerLiteService()

// Helper functions for common operations
export async function subscribeUserToNewsletter(
  email: string,
  userTier?: 'FREE' | 'PRO' | 'TEAM'
) {
  return mailerLite.subscribe(email, {
    fields: {
      user_tier: userTier || 'FREE',
      signup_source: 'website',
      subscribed_at: new Date().toISOString()
    }
  })
}

export async function subscribeUserToWaitlist(email: string, source: string = 'website') {
  const groupId = process.env.MAILERLITE_WAITLIST_GROUP_ID

  return mailerLite.subscribe(email, {
    fields: {
      waitlist_source: source,
      signed_up_at: new Date().toISOString(),
      status: 'waitlist'
    },
    groups: groupId ? [groupId] : undefined
  })
}

export async function updateUserTierInMailerLite(email: string, newTier: 'FREE' | 'PRO' | 'TEAM') {
  const subscriber = await mailerLite.getSubscriber(email)

  if (subscriber) {
    await mailerLite.updateSubscriberFields(email, {
      user_tier: newTier,
      tier_updated_at: new Date().toISOString()
    })
  }
}

// Pre-defined field names (configure these in your MailerLite account)
export const MAILERLITE_FIELDS = {
  USER_TIER: 'user_tier',
  WAITLIST_SOURCE: 'waitlist_source',
  SIGNED_UP_AT: 'signed_up_at',
  STATUS: 'status',
  SUBSCRIBED_AT: 'subscribed_at',
  TIER_UPDATED_AT: 'tier_updated_at'
} as const
