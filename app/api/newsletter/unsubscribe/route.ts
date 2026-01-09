import { NextRequest, NextResponse } from 'next/server'
import { mailerLite } from '@/lib/mailerlite'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Unsubscribe from MailerLite
    await mailerLite.unsubscribe(email)

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)

    return NextResponse.json({
      error: 'Failed to unsubscribe from newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return new Response(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h2>Unsubscribe from DealMecca Newsletter</h2>
          <p>Please provide your email address to unsubscribe.</p>
          <form action="/api/newsletter/unsubscribe" method="get">
            <input type="email" name="email" placeholder="your@email.com" required style="padding: 10px; width: 300px;" />
            <button type="submit" style="padding: 10px 20px; background: #dc2626; color: white; border: none; cursor: pointer;">Unsubscribe</button>
          </form>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  try {
    await mailerLite.unsubscribe(email)

    return new Response(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
          <h2>✅ Successfully Unsubscribed</h2>
          <p>You have been unsubscribed from the DealMecca newsletter.</p>
          <p>We're sorry to see you go!</p>
          <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Return to DealMecca</a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)

    return new Response(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
          <h2>❌ Unsubscribe Failed</h2>
          <p>We couldn't process your unsubscribe request. Please try again or contact support.</p>
          <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Return to DealMecca</a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}