'use server';

import { prisma } from '../lib/db';
import { redirect } from 'next/navigation';

export async function createInquiry(formData: FormData) {
  const listingId = String(formData.get('listingId') || '');
  const slug = String(formData.get('slug') || '');
  const guestEmail = String(formData.get('guestEmail') || '').trim();
  const guestName = String(formData.get('guestName') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!listingId || !guestEmail || !message) {
    // Bare-min validation
    redirect(`/listing/${slug}?error=missing`);
  }

  await prisma.inquiry.create({
    data: {
      listingId,
      guestEmail,
      guestName: guestName || null,
      phone: phone || null,
      message,
      status: 'PENDING',
      spamScore: 0,
    },
  });

  // Later: trigger email/SMS to owner via Resend/Twilio queue.
  redirect(`/listing/${slug}?success=1`);
}