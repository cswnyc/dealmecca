// Utility functions for tracking user networking activities

export async function trackActivity(
  interactionType: string,
  options: {
    companyId?: string;
    contactId?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<boolean> {
  try {
    const response = await fetch('/api/networking/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactionType,
        companyId: options.companyId,
        contactId: options.contactId,
        metadata: options.metadata,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track activity:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error tracking activity:', error);
    return false;
  }
}

// Specific tracking functions for common activities
export const ActivityTracker = {
  // Profile views
  viewCompanyProfile: (companyId: string, companyName?: string) =>
    trackActivity('COMPANY_PROFILE_VIEWED', {
      companyId,
      metadata: { companyName }
    }),

  viewContactProfile: (contactId: string, companyId?: string, contactName?: string) =>
    trackActivity('CONTACT_PROFILE_VIEWED', {
      companyId,
      contactId,
      metadata: { contactName }
    }),

  // Forum interactions
  createForumPost: (companyMentions?: string[], contactMentions?: string[]) =>
    trackActivity('FORUM_POST_CREATED', {
      metadata: { 
        companyMentions: companyMentions || [],
        contactMentions: contactMentions || []
      }
    }),

  mentionCompany: (companyId: string, postId?: string, companyName?: string) =>
    trackActivity('COMPANY_MENTIONED', {
      companyId,
      metadata: { postId, companyName }
    }),

  mentionContact: (contactId: string, companyId?: string, postId?: string, contactName?: string) =>
    trackActivity('CONTACT_MENTIONED', {
      companyId,
      contactId,
      metadata: { postId, contactName }
    }),

  participateInDiscussion: (postId: string, companyId?: string, discussionTitle?: string) =>
    trackActivity('DISCUSSION_PARTICIPATED', {
      companyId,
      metadata: { postId, discussionTitle }
    }),

  // Event interactions
  joinNetworkingEvent: (eventId: string, eventName?: string, companyAffiliations?: string[]) =>
    trackActivity('NETWORKING_EVENT_JOINED', {
      metadata: { 
        eventId,
        eventName,
        companyAffiliations: companyAffiliations || []
      }
    }),

  // Other networking activities
  bookmarkPost: (postId: string, companyId?: string) =>
    trackActivity('POST_BOOKMARKED', {
      companyId,
      metadata: { postId }
    }),

  shareExpertise: (topicArea: string, companyId?: string) =>
    trackActivity('EXPERTISE_SHARED', {
      companyId,
      metadata: { topicArea }
    }),

  answerQuestion: (questionId: string, companyId?: string) =>
    trackActivity('QUESTION_ANSWERED', {
      companyId,
      metadata: { questionId }
    }),

  shareOpportunity: (opportunityType: string, companyId?: string) =>
    trackActivity('OPPORTUNITY_SHARED', {
      companyId,
      metadata: { opportunityType }
    })
};

// Hook for tracking activities in React components
export function useActivityTracking() {
  return {
    trackActivity,
    ...ActivityTracker
  };
} 