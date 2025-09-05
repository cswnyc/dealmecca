import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 === NEXTAUTH FLOW TEST START ===')
  
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required'
      }, { status: 400 })
    }
    
    console.log('🔑 Testing NextAuth flow for:', email)
    
    // Step 1: Get CSRF token
    console.log('🔒 Step 1: Getting CSRF token...')
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`
    
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    if (!csrfResponse.ok) {
      throw new Error(`CSRF fetch failed: ${csrfResponse.status}`)
    }
    
    const csrfData = await csrfResponse.json()
    console.log('✅ CSRF token obtained')
    
    // Step 2: Attempt signin
    console.log('🔐 Step 2: Attempting NextAuth signin...')
    
    const signinResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        email: email,
        password: password,
        redirect: 'false'
      }).toString()
    })
    
    console.log('📊 Signin response status:', signinResponse.status)
    console.log('📊 Signin response headers:', Object.fromEntries(signinResponse.headers.entries()))
    
    // Check for redirect (success) or error
    if (signinResponse.status === 302) {
      const location = signinResponse.headers.get('location')
      console.log('✅ NextAuth signin successful - redirect to:', location)
      
      // Extract cookies from Set-Cookie headers
      const setCookieHeaders = signinResponse.headers.get('set-cookie')
      console.log('🍪 Set-Cookie headers:', setCookieHeaders)
      
      return NextResponse.json({
        success: true,
        message: 'NextAuth signin successful',
        redirectLocation: location,
        hasCookies: !!setCookieHeaders,
        cookieCount: setCookieHeaders ? setCookieHeaders.split(',').length : 0,
        csrfToken: csrfData.csrfToken,
        timestamp: new Date().toISOString()
      })
      
    } else {
      const responseText = await signinResponse.text()
      console.log('❌ NextAuth signin failed:', responseText)
      
      return NextResponse.json({
        success: false,
        error: 'NextAuth signin failed',
        status: signinResponse.status,
        response: responseText,
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('❌ NextAuth flow test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'NextAuth flow test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 