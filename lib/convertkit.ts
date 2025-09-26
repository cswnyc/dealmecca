/**
 * ConvertKit API Integration
 *
 * This service handles all ConvertKit operations including:
 * - Subscriber management
 * - Tag management
 * - Form submissions
 * - Sequence enrollment
 */

const CONVERTKIT_API_BASE = 'https://api.convertkit.com/v3'

interface ConvertKitSubscriber {
  id: number
  first_name?: string
  email_address: string
  state: 'active' | 'unsubscribed' | 'bounced' | 'complained'
  created_at: string
  fields?: Record<string, any>
  tags?: Array<{
    id: number
    name: string
    created_at: string
  }>
}

interface ConvertKitTag {
  id: number
  name: string
  created_at: string
}

interface ConvertKitForm {
  id: number
  name: string
  created_at: string
  type: string
}

interface SubscribeOptions {
  firstName?: string
  tags?: string[]
  fields?: Record<string, any>
  formId?: number
}

class ConvertKitService {
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.apiKey = process.env.CONVERTKIT_API_KEY || ''
    this.apiSecret = process.env.CONVERTKIT_API_SECRET || ''

    if (!this.apiKey || !this.apiSecret) {
      console.warn('ConvertKit API credentials not configured')
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('ConvertKit API credentials not configured')
    }

    const url = `${CONVERTKIT_API_BASE}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ConvertKit API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Subscribe a user to ConvertKit
   */
  async subscribe(email: string, options: SubscribeOptions = {}): Promise<ConvertKitSubscriber> {
    const { firstName, tags, fields, formId } = options

    const payload: any = {
      email,
      api_key: this.apiKey
    }

    if (firstName) {
      payload.first_name = firstName
    }

    if (fields) {
      payload.fields = fields
    }

    if (tags && tags.length > 0) {
      payload.tags = tags
    }

    // Use form subscription if formId provided, otherwise use direct subscription
    const endpoint = formId
      ? `/forms/${formId}/subscribe`
      : '/subscribers'

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  /**
   * Get subscriber by email
   */
  async getSubscriber(email: string): Promise<ConvertKitSubscriber | null> {
    try {
      const response = await this.makeRequest(`/subscribers?api_secret=${this.apiSecret}&email_address=${email}`)
      return response.subscribers?.[0] || null
    } catch (error) {
      console.error('Error fetching subscriber:', error)
      return null
    }
  }

  /**
   * Update subscriber information
   */
  async updateSubscriber(subscriberId: number, updates: Partial<ConvertKitSubscriber>): Promise<ConvertKitSubscriber> {
    return this.makeRequest(`/subscribers/${subscriberId}`, {
      method: 'PUT',
      body: JSON.stringify({
        api_secret: this.apiSecret,
        ...updates
      })
    })
  }

  /**
   * Add tags to a subscriber
   */
  async addTagsToSubscriber(email: string, tagIds: number[]): Promise<void> {
    for (const tagId of tagIds) {
      await this.makeRequest(`/tags/${tagId}/subscribe`, {
        method: 'POST',
        body: JSON.stringify({
          api_key: this.apiKey,
          email
        })
      })
    }
  }

  /**
   * Remove tags from a subscriber
   */
  async removeTagsFromSubscriber(subscriberId: number, tagIds: number[]): Promise<void> {
    for (const tagId of tagIds) {
      await this.makeRequest(`/subscribers/${subscriberId}/tags/${tagId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          api_secret: this.apiSecret
        })
      })
    }
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<ConvertKitTag[]> {
    const response = await this.makeRequest(`/tags?api_key=${this.apiKey}`)
    return response.tags || []
  }

  /**
   * Create a new tag
   */
  async createTag(name: string): Promise<ConvertKitTag> {
    return this.makeRequest('/tags', {
      method: 'POST',
      body: JSON.stringify({
        api_secret: this.apiSecret,
        tag: { name }
      })
    })
  }

  /**
   * Get all forms
   */
  async getForms(): Promise<ConvertKitForm[]> {
    const response = await this.makeRequest(`/forms?api_key=${this.apiKey}`)
    return response.forms || []
  }

  /**
   * Unsubscribe a user
   */
  async unsubscribe(email: string): Promise<void> {
    await this.makeRequest('/unsubscribe', {
      method: 'PUT',
      body: JSON.stringify({
        api_secret: this.apiSecret,
        email
      })
    })
  }

  /**
   * Add subscriber to a sequence
   */
  async addToSequence(email: string, sequenceId: number): Promise<void> {
    await this.makeRequest(`/sequences/${sequenceId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        api_key: this.apiKey,
        email
      })
    })
  }
}

// Create singleton instance
export const convertKit = new ConvertKitService()

// Helper functions for common operations
export async function subscribeUserToNewsletter(
  email: string,
  firstName?: string,
  userTier?: 'FREE' | 'PRO' | 'TEAM'
) {
  const tags = ['newsletter']

  // Add tier-specific tags
  if (userTier && userTier !== 'FREE') {
    tags.push(`tier-${userTier.toLowerCase()}`)
  }

  return convertKit.subscribe(email, {
    firstName,
    tags,
    fields: {
      user_tier: userTier || 'FREE',
      signup_source: 'website'
    }
  })
}

export async function subscribeUserToWaitlist(email: string, source: string = 'website') {
  return convertKit.subscribe(email, {
    tags: ['waitlist'],
    fields: {
      waitlist_source: source,
      signed_up_at: new Date().toISOString()
    }
  })
}

export async function updateUserTierInConvertKit(email: string, newTier: 'FREE' | 'PRO' | 'TEAM') {
  const subscriber = await convertKit.getSubscriber(email)

  if (subscriber) {
    // Remove old tier tags
    const oldTierTags = ['tier-free', 'tier-pro', 'tier-team']
    const tagIds = await convertKit.getTags()
    const oldTierTagIds = tagIds
      .filter(tag => oldTierTags.includes(tag.name))
      .map(tag => tag.id)

    if (oldTierTagIds.length > 0) {
      await convertKit.removeTagsFromSubscriber(subscriber.id, oldTierTagIds)
    }

    // Add new tier tag
    if (newTier !== 'FREE') {
      await convertKit.addTagsToSubscriber(email, [`tier-${newTier.toLowerCase()}`])
    }

    // Update custom field
    await convertKit.updateSubscriber(subscriber.id, {
      fields: {
        ...subscriber.fields,
        user_tier: newTier
      }
    })
  }
}

// Pre-defined tag and form IDs (configure these in your ConvertKit account)
export const CONVERTKIT_TAGS = {
  NEWSLETTER: 'newsletter',
  WAITLIST: 'waitlist',
  FREE_TIER: 'tier-free',
  PRO_TIER: 'tier-pro',
  TEAM_TIER: 'tier-team',
  FORUM_ACTIVE: 'forum-active',
  ONBOARDING: 'onboarding'
} as const

export const CONVERTKIT_SEQUENCES = {
  WELCOME: 1, // Replace with actual sequence ID
  ONBOARDING: 2, // Replace with actual sequence ID
  PRO_FEATURES: 3 // Replace with actual sequence ID
} as const