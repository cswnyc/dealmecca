/**
 * Utility functions for normalizing data for efficient duplicate detection
 */

/**
 * Normalize a company name for duplicate detection
 * - Convert to lowercase
 * - Remove punctuation and special characters
 * - Remove common legal entity suffixes
 * - Normalize whitespace
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    // Remove punctuation and special characters, keep only letters, numbers, and spaces
    .replace(/[^\w\s]/g, ' ')
    // Remove common legal entity suffixes
    .replace(/\b(inc|corp|corporation|company|ltd|limited|llc|group|plc|co|llp|lp|sa|ag|gmbh|bv|nv|spa|srl|oy|ab|as|aps|kft|sas|sarl|pty|pvt|pte|bhd|sdn|pte ltd|pty ltd|pvt ltd)\b/gi, '')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a website/domain for duplicate detection
 * - Convert to lowercase
 * - Remove protocol (http://, https://)
 * - Remove www. prefix
 * - Remove trailing slash and path
 * - Get just the domain part
 */
export function normalizeWebsite(website: string): string {
  if (!website) return '';
  
  return website
    .toLowerCase()
    .trim()
    // Remove protocol
    .replace(/^https?:\/\//, '')
    // Remove www prefix
    .replace(/^www\./, '')
    // Remove trailing slash and everything after it (path, query params, etc.)
    .split('/')[0]
    // Remove port numbers
    .split(':')[0]
    .trim();
}

/**
 * Normalize an email for duplicate detection
 * - Convert to lowercase
 * - Trim whitespace
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim();
}

/**
 * Normalize a person's name for duplicate detection
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove extra spaces
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Check if two normalized strings are similar enough to be considered duplicates
 * Uses simple string similarity (can be enhanced with fuzzy matching libraries)
 */
export function areSimilar(str1: string, str2: string, threshold: number = 0.8): boolean {
  if (!str1 || !str2) return false;
  
  // Exact match
  if (str1 === str2) return true;
  
  // Simple Levenshtein distance ratio
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return true;
  
  const distance = levenshteinDistance(str1, str2);
  const similarity = 1 - (distance / maxLength);
  
  return similarity >= threshold;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Utility to prepare company data with normalized fields
 */
export function prepareCompanyForDatabase(companyData: {
  name: string;
  website?: string;
  [key: string]: any;
}) {
  const normalized = {
    normalizedName: normalizeCompanyName(companyData.name),
    normalizedWebsite: companyData.website ? normalizeWebsite(companyData.website) : null
  };
  
  return {
    ...companyData,
    ...normalized
  };
}

export default {
  normalizeCompanyName,
  normalizeWebsite,
  normalizeEmail,
  normalizeName,
  areSimilar,
  prepareCompanyForDatabase
};
