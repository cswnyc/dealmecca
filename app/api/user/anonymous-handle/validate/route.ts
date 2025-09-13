import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ADDITIONAL_ANONYMOUS_HANDLES } from '@/scripts/create-forum-users';

// Validate anonymous handle availability
export async function POST(request: NextRequest) {
  try {
    const { handle, userId } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!handleRegex.test(handle)) {
      return NextResponse.json({
        isAvailable: false,
        error: 'Invalid format. Use 3-20 characters: letters, numbers, underscores, or hyphens only.',
        suggestions: generateSuggestions(handle.slice(0, 15))
      });
    }

    // Check if handle is already taken
    const existingUser = await prisma.user.findUnique({
      where: { anonymousHandle: handle },
      select: { id: true }
    });

    const isAvailable = !existingUser || (userId && existingUser.id === userId);

    if (!isAvailable) {
      return NextResponse.json({
        isAvailable: false,
        error: 'This handle is already taken',
        suggestions: generateSuggestions(handle)
      });
    }

    return NextResponse.json({
      isAvailable: true,
      handle
    });

  } catch (error) {
    console.error('Error validating anonymous handle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSuggestions(baseHandle: string): string[] {
  const suggestions: string[] = [];
  const cleanBase = baseHandle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
  
  // Generate numbered variations
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${cleanBase}${i}`);
  }
  
  // Generate year variations
  const currentYear = new Date().getFullYear();
  suggestions.push(`${cleanBase}${currentYear}`);
  suggestions.push(`${cleanBase}${currentYear - 1}`);
  
  // Add some random suffixes
  const suffixes = ['Pro', 'Expert', 'Ace', 'Star', 'Elite', 'Prime'];
  suffixes.forEach(suffix => {
    if ((cleanBase + suffix).length <= 20) {
      suggestions.push(`${cleanBase}${suffix}`);
    }
  });
  
  // Add some from our predefined list that might be similar
  const similarHandles = ADDITIONAL_ANONYMOUS_HANDLES.filter(handle => 
    handle.toLowerCase().includes(cleanBase.toLowerCase().slice(0, 5)) ||
    cleanBase.toLowerCase().includes(handle.toLowerCase().slice(0, 5))
  ).slice(0, 3);
  
  suggestions.push(...similarHandles);
  
  return suggestions.filter((v, i, a) => a.indexOf(v) === i).slice(0, 8); // Remove duplicates and limit to 8
}