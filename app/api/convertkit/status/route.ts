import { NextRequest, NextResponse } from 'next/server'
import { convertKit } from '@/lib/convertkit'

export async function GET(request: NextRequest) {
  try {
    // Check if ConvertKit credentials are configured
    const hasApiKey = !!process.env.CONVERTKIT_API_KEY && process.env.CONVERTKIT_API_KEY !== 'your-convertkit-api-key-here'
    const hasApiSecret = !!process.env.CONVERTKIT_API_SECRET && process.env.CONVERTKIT_API_SECRET !== 'your-convertkit-api-secret-here'

    if (!hasApiKey || !hasApiSecret) {
      return NextResponse.json({
        configured: false,
        error: 'ConvertKit API credentials not configured',
        details: {
          apiKey: hasApiKey ? 'configured' : 'missing or placeholder',
          apiSecret: hasApiSecret ? 'configured' : 'missing or placeholder'
        }
      })
    }

    try {
      // Test API connection by fetching tags
      const tags = await convertKit.getTags()

      // Test API connection by fetching forms
      const forms = await convertKit.getForms()

      return NextResponse.json({
        configured: true,
        status: 'connected',
        stats: {
          tags: tags.length,
          forms: forms.length
        },
        availableTags: tags.slice(0, 5), // Show first 5 tags
        availableForms: forms.slice(0, 3) // Show first 3 forms
      })

    } catch (apiError: any) {
      return NextResponse.json({
        configured: true,
        status: 'error',
        error: 'ConvertKit API connection failed',
        details: apiError.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('ConvertKit status check error:', error)
    return NextResponse.json({
      configured: false,
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}