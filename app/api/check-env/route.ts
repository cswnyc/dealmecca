import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if essential environment variables are set
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'set (hidden)' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set (hidden)' : 'NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set (hidden)' : 'not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set (hidden)' : 'not set',
  };

  // Check for common issues
  const issues = [];
  
  if (!process.env.NEXTAUTH_SECRET) {
    issues.push('NEXTAUTH_SECRET is required for authentication');
  } else if (process.env.NEXTAUTH_SECRET.length < 32) {
    issues.push('NEXTAUTH_SECRET should be at least 32 characters long');
  }
  
  if (!process.env.NEXTAUTH_URL) {
    issues.push('NEXTAUTH_URL is required for authentication');
  }
  
  if (!process.env.DATABASE_URL) {
    issues.push('DATABASE_URL is required for database access');
  }

  return NextResponse.json({
    environment: envStatus,
    issues: issues,
    isProductionReady: issues.length === 0,
    timestamp: new Date().toISOString()
  });
} 