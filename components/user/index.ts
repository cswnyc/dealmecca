/**
 * User Components Export
 * Centralized exports for all user-related components
 */

// Avatar components
export {
  Avatar,
  AvatarSVG,
  AvatarSmall,
  AvatarMedium,
  AvatarLarge,
  AvatarXLarge
} from './Avatar';

// Profile components
export {
  UserProfile,
  UserProfileCompact,
  UserProfileCard,
  UsernameBadge
} from './UserProfile';

// Re-export types
export type { AnonymousUser } from '@/hooks/useAnonymousAuth';