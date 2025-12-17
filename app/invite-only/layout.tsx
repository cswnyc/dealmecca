import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Currently Invite-Only | DealMecca',
  description: 'Join the waitlist for DealMecca - the intelligence platform that closes deals faster. Currently in private beta for media sales professionals.',
  keywords: [
    'invite only',
    'waitlist',
    'media sales intelligence',
    'sales platform',
    'beta access',
    'deal intelligence',
    'media sales tools'
  ],
  openGraph: {
    title: 'Currently Invite-Only | DealMecca',
    description: 'Join the waitlist for exclusive early access to the intelligence platform that closes deals faster.',
    url: 'https://www.getmecca.com/invite-only',
    siteName: 'DealMecca',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Currently Invite-Only | DealMecca',
    description: 'Join the waitlist for exclusive early access to the intelligence platform that closes deals faster.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function InviteOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
