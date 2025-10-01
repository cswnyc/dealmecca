import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();

  const cookieInfo = allCookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value,
    length: cookie.value.length
  }));

  const linkedInCookie = request.cookies.get('linkedin-auth');

  return NextResponse.json({
    allCookies: cookieInfo,
    linkedInAuth: linkedInCookie ? {
      value: linkedInCookie.value,
      parsed: linkedInCookie.value.startsWith('linkedin-')
        ? linkedInCookie.value.replace('linkedin-', '')
        : 'Invalid format'
    } : null,
    headers: {
      'x-user-id': request.headers.get('x-user-id'),
      cookie: request.headers.get('cookie')?.substring(0, 200)
    }
  });
}
