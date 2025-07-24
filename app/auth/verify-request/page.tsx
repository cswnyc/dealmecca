'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle } from 'lucide-react'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent you a sign in link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">
                A sign in link has been sent to your email address.
              </p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Click the link in the email to sign in to your account.
            </p>
            <p className="text-xs text-gray-500">
              If you don't see the email, check your spam folder.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 