import { Suspense } from 'react';
import Link from 'next/link';
import { getStripe } from '../../../lib/stripe';

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Subscription Successful!
          </h1>
          
          <p className="text-green-700 mb-6">
            Thank you for subscribing! Your payment has been processed successfully.
          </p>
          
          {session.customer_details?.email && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Confirmation Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {session.customer_details.email}</p>
                <p><strong>Amount:</strong> ${(session.amount_total || 0) / 100}</p>
                {session.subscription && (
                  <p><strong>Subscription ID:</strong> {session.subscription}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              A confirmation email has been sent to your email address. 
              Your subscription is now active and you can start managing your listings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/owner/billing"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                View Billing Dashboard
              </Link>
              <Link
                href="/owner/listings"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Manage Listings
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Your subscription is now active and billing has begun</li>
            <li>• You can now publish and activate your listings</li>
            <li>• Access premium features based on your selected plan</li>
            <li>• Manage your subscription anytime in the billing dashboard</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">
            Subscription Complete
          </h1>
          <p className="text-yellow-700 mb-6">
            Your subscription has been processed successfully. We're confirming the details now.
          </p>
          <Link
            href="/owner/billing"
            className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go to Billing Dashboard
          </Link>
        </div>
      </div>
    );
  }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;
  
  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Invalid Session
          </h1>
          <p className="text-red-700 mb-6">
            No checkout session ID was provided. Please try subscribing again.
          </p>
          <Link
            href="/owner/billing"
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Billing
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <SuccessContent sessionId={sessionId} />
    </Suspense>
  );
}