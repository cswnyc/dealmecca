import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import { getAuthUser } from './authUser';

type AdminContext = { user: User };

export async function requireAdmin(request: NextRequest): Promise<AdminContext | NextResponse> {
  const authResult = await getAuthUser(request, { requireApproved: true });
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const isAdmin = user.role === 'ADMIN';
  if (!isAdmin) {
    return NextResponse.json(
      {
        error: 'forbidden',
        message: 'Admin access required',
      },
      { status: 403 }
    );
  }

  return { user };
}

