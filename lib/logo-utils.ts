// 🎨 Logo & Photo Helper Functions
// Automated company logos and contact photos with intelligent fallbacks

import crypto from 'crypto';

/**
 * Get company logo URL from Google Favicons
 * Free, reliable, 256x256 resolution
 *
 * @param domain - Company domain (e.g., "coca-cola.com")
 * @param companyName - Company name (optional, for fallback)
 * @returns Logo URL or null if no domain
 */
export function getCompanyLogoUrl(domain?: string, companyName?: string): string | null {
  if (!domain) return null;

  // Remove protocol if included
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');

  // Google Favicons API - high resolution (256x256)
  return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`;
}

/**
 * Get contact photo URL with tiered fallback strategy
 * Priority: Uploaded photo > Gravatar > DiceBear avatar
 *
 * @param firstName - Contact first name
 * @param lastName - Contact last name
 * @param email - Contact email (optional, for Gravatar)
 * @param uploadedPhotoUrl - Manually uploaded photo URL (optional, highest priority)
 * @returns Photo URL (always returns a value)
 */
export function getContactPhotoUrl(
  firstName: string,
  lastName: string,
  email?: string,
  uploadedPhotoUrl?: string | null
): string {
  // Priority 1: Manual upload (admin uploaded real photo)
  if (uploadedPhotoUrl) {
    return uploadedPhotoUrl;
  }

  // Priority 2: Gravatar (if email exists)
  if (email) {
    const gravatarUrl = getGravatarUrl(email);
    // Return Gravatar with DiceBear fallback
    // Gravatar's 'd' parameter provides fallback if email not registered
    const seed = `${firstName}${lastName}`.replace(/\s/g, '');
    return `${gravatarUrl}&d=${encodeURIComponent(`https://api.dicebear.com/7.x/personas/svg?seed=${seed}`)}`;
  }

  // Priority 3: DiceBear personas (professional, diverse avatars)
  return getDiceBearAvatarUrl(firstName, lastName);
}

/**
 * Generate Gravatar URL from email
 *
 * @param email - Contact email address
 * @returns Gravatar URL (without fallback parameter)
 */
export function getGravatarUrl(email: string): string {
  const hash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex');

  return `https://www.gravatar.com/avatar/${hash}?s=400`; // 400x400 size
}

/**
 * Generate DiceBear avatar URL
 * Consistent generation - same name always produces same avatar
 *
 * @param firstName - Contact first name
 * @param lastName - Contact last name
 * @param style - Avatar style (default: 'personas' for professional look)
 * @returns DiceBear avatar URL
 */
export function getDiceBearAvatarUrl(
  firstName: string,
  lastName: string,
  style: 'personas' | 'avataaars' | 'initials' = 'personas'
): string {
  const seed = `${firstName}${lastName}`.replace(/\s/g, '');

  // Personas style: Professional, diverse, business-appropriate
  if (style === 'initials') {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&chars=${initials}&backgroundColor=random`;
  }

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

/**
 * Validate if a URL points to an accessible image
 * Useful for checking if Gravatar exists before using fallback
 *
 * @param url - Image URL to check
 * @returns Promise<boolean> - true if image is accessible
 */
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Extract domain from various URL formats
 * Handles website URLs, email domains, etc.
 *
 * @param input - URL or email address
 * @returns Clean domain or null
 */
export function extractDomain(input?: string): string | null {
  if (!input) return null;

  // If it's an email, extract domain
  if (input.includes('@')) {
    return input.split('@')[1];
  }

  // If it's a URL, extract domain
  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    // If not a valid URL, return as-is (might already be a domain)
    return input.replace(/^www\./, '');
  }
}

/**
 * Get photo URL type for debugging/analytics
 * Identifies which fallback level is being used
 *
 * @param photoUrl - The photo URL
 * @returns 'uploaded' | 'gravatar' | 'dicebear' | 'unknown'
 */
export function getPhotoUrlType(photoUrl: string): 'uploaded' | 'gravatar' | 'dicebear' | 'unknown' {
  if (photoUrl.includes('vercel') || photoUrl.includes('blob')) {
    return 'uploaded';
  }
  if (photoUrl.includes('gravatar.com')) {
    return 'gravatar';
  }
  if (photoUrl.includes('dicebear.com')) {
    return 'dicebear';
  }
  return 'unknown';
}
