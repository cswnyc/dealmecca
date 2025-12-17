'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { motionVariants, designTokens, shouldReduceMotion } from '@/lib/design-tokens';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className = '' }: WaitlistFormProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const reducedMotion = shouldReduceMotion();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'invite-only',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      if (data.status === 'already_exists') {
        setError('This email is already registered for early access');
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        {...motionVariants.scaleIn}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className={cn('max-w-md mx-auto', className)}
      >
        <Card className="bg-card/80 backdrop-blur-sm border-accent/20 shadow-glow-lg">
          <CardContent className="p-8 text-center">
            <motion.div
              {...motionVariants.scaleIn}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.2, ...designTokens.transitions.spring }}
            >
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              You're on the list!
            </h3>
            <p className="text-muted-foreground text-sm">
              We'll notify you when early access becomes available.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : 1.5, duration: reducedMotion ? 0 : 0.6 }}
      className={cn('max-w-2xl mx-auto', className)}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="bg-card/60 backdrop-blur-md border-border/50 shadow-premium-lg">
          <CardContent className="p-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-12 h-12 bg-background/80 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-0 font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                size="lg"
                className="h-12 px-8 bg-gradient-accent hover:shadow-glow-lg transition-all font-bold gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Join Waitlist</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <motion.div
            {...motionVariants.fadeIn}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          >
            <Card className="bg-red-500/20 border-red-400/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-red-100 text-sm text-center font-medium">
                  {error}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
