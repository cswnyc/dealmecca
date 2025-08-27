"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeadFormProps {
  listingId: string;
  listingTitle?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  onSuccess?: () => void;
  className?: string;
}

export function LeadForm({
  listingId,
  listingTitle,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 1,
  onSuccess,
  className
}: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    const inquiryData = {
      listingId,
      guestName: formData.get("guestName") as string,
      guestEmail: formData.get("guestEmail") as string,
      guestPhone: formData.get("guestPhone") as string,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
      guests: parseInt(formData.get("guests") as string),
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send inquiry");
      }

      setSuccess(true);
      onSuccess?.();
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error("Inquiry submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to send inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inquiry Sent!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your interest. The property owner will contact you soon.
          </p>
          <Button
            variant="outline"
            onClick={() => setSuccess(false)}
            className="w-full"
          >
            Send Another Inquiry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Contact Host
        </CardTitle>
        {listingTitle && (
          <p className="text-sm text-gray-600">{listingTitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sm font-medium">
                Check-in Date *
              </Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                required
                defaultValue={defaultCheckIn}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-sm font-medium">
                Check-out Date *
              </Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                required
                defaultValue={defaultCheckOut}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests" className="text-sm font-medium">
              Number of Guests *
            </Label>
            <Input
              id="guests"
              name="guests"
              type="number"
              min="1"
              max="20"
              required
              defaultValue={defaultGuests}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-sm font-medium">
              Your Name *
            </Label>
            <Input
              id="guestName"
              name="guestName"
              type="text"
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="guestEmail"
              name="guestEmail"
              type="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="text-sm font-medium">
              Phone Number (Optional)
            </Label>
            <Input
              id="guestPhone"
              name="guestPhone"
              type="tel"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Tell the host about your trip, any special requests, or questions you might have..."
              className="resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Inquiry
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting this form, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}