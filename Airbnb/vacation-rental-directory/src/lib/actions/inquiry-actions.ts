"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const inquirySchema = z.object({
  listingId: z.string().min(1),
  guestName: z.string().min(1, "Name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().optional(),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.number().min(1, "Number of guests is required"),
  message: z.string().optional(),
});

export async function createInquiry(formData: FormData) {
  try {
    const rawData = {
      listingId: formData.get("listingId") as string,
      guestName: formData.get("guestName") as string,
      guestEmail: formData.get("guestEmail") as string,
      guestPhone: formData.get("guestPhone") as string,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
      guests: parseInt(formData.get("guests") as string),
      message: formData.get("message") as string,
    };

    const validatedData = inquirySchema.parse(rawData);
    
    // Get user session if logged in
    const session = await auth();
    
    // Get request info for spam protection
    const headersList = headers();
    const userAgent = headersList.get("user-agent");
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";

    // Check if listing exists and is active
    const listing = await prisma.listing.findFirst({
      where: { 
        id: validatedData.listingId,
        status: "ACTIVE"
      },
      include: {
        owner: {
          include: {
            user: { select: { email: true } }
          }
        }
      }
    });

    if (!listing) {
      return { success: false, error: "Listing not found or not active" };
    }

    // Validate dates
    const checkInDate = new Date(validatedData.checkIn);
    const checkOutDate = new Date(validatedData.checkOut);
    const today = new Date();
    
    if (checkInDate < today) {
      return { success: false, error: "Check-in date cannot be in the past" };
    }
    
    if (checkOutDate <= checkInDate) {
      return { success: false, error: "Check-out date must be after check-in date" };
    }

    // Check availability (basic check)
    const conflictingBooking = await prisma.availability.findFirst({
      where: {
        listingId: validatedData.listingId,
        status: "BOOKED",
        startDate: { lte: checkOutDate },
        endDate: { gte: checkInDate },
      },
    });

    if (conflictingBooking) {
      return { success: false, error: "Selected dates are not available" };
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        listingId: validatedData.listingId,
        guestId: session?.user?.id,
        guestName: validatedData.guestName,
        guestEmail: validatedData.guestEmail,
        guestPhone: validatedData.guestPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: validatedData.guests,
        message: validatedData.message,
        ipAddress,
        userAgent,
      },
    });

    // TODO: Send notification email to owner
    // await sendInquiryNotification(listing.owner.user.email, inquiry);

    revalidatePath(`/listing/${listing.slug}`);
    revalidatePath("/owner/inquiries");

    return { success: true, inquiryId: inquiry.id };
  } catch (error) {
    console.error("Error creating inquiry:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to submit inquiry. Please try again." 
    };
  }
}

export async function updateInquiryStatus(inquiryId: string, status: "PENDING" | "RESPONDED" | "ARCHIVED") {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify user owns this inquiry's listing
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        listing: {
          owner: {
            userId: session.user.id
          }
        }
      }
    });

    if (!inquiry) {
      return { success: false, error: "Inquiry not found or access denied" };
    }

    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status }
    });

    revalidatePath("/owner/inquiries");

    return { success: true };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { 
      success: false, 
      error: "Failed to update inquiry status" 
    };
  }
}