"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  description: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
  sleeps: z.number().min(1, "Must accommodate at least 1 guest"),
  maxGuests: z.number().min(1, "Must accommodate at least 1 guest"),
  basePrice: z.number().min(0, "Price cannot be negative").optional(),
  cleaningFee: z.number().min(0, "Cleaning fee cannot be negative").optional(),
  securityDeposit: z.number().min(0, "Security deposit cannot be negative").optional(),
  cityId: z.string().min(1, "City is required"),
  neighborhoodId: z.string().optional(),
});

export async function createListing(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has owner profile
    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        listings: true,
        subs: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!ownerProfile) {
      redirect("/owner/onboarding");
    }

    // Check subscription limits
    const currentSub = ownerProfile.subs[0];
    if (!currentSub) {
      return { success: false, error: "No active subscription found" };
    }

    if (ownerProfile.listings.length >= currentSub.maxListings) {
      return { 
        success: false, 
        error: `Your ${currentSub.tier} plan allows only ${currentSub.maxListings} listings. Upgrade to add more.` 
      };
    }

    const rawData = {
      title: formData.get("title") as string,
      summary: formData.get("summary") as string,
      description: formData.get("description") as string,
      propertyType: formData.get("propertyType") as string,
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseFloat(formData.get("bathrooms") as string),
      sleeps: parseInt(formData.get("sleeps") as string),
      maxGuests: parseInt(formData.get("maxGuests") as string),
      basePrice: formData.get("basePrice") ? parseInt(formData.get("basePrice") as string) * 100 : undefined, // Convert to cents
      cleaningFee: formData.get("cleaningFee") ? parseInt(formData.get("cleaningFee") as string) * 100 : undefined,
      securityDeposit: formData.get("securityDeposit") ? parseInt(formData.get("securityDeposit") as string) * 100 : undefined,
      cityId: formData.get("cityId") as string,
      neighborhoodId: formData.get("neighborhoodId") as string || undefined,
    };

    const validatedData = listingSchema.parse(rawData);

    // Generate slug
    const baseSlug = validatedData.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        slug,
        ownerId: ownerProfile.id,
        status: "DRAFT", // Start as draft, require admin approval
      },
    });

    revalidatePath("/owner");
    revalidatePath("/owner/listings");

    return { 
      success: true, 
      listingId: listing.id,
      slug: listing.slug
    };
  } catch (error) {
    console.error("Error creating listing:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create listing. Please try again." 
    };
  }
}

export async function updateListingStatus(listingId: string, status: "ACTIVE" | "SUSPENDED" | "DRAFT") {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Not authorized" };
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/listings");
    revalidatePath("/owner");

    return { success: true };
  } catch (error) {
    console.error("Error updating listing status:", error);
    return { 
      success: false, 
      error: "Failed to update listing status" 
    };
  }
}

export async function deleteListing(listingId: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership or admin role
    const listing = await prisma.listing.findFirst({
      where: { 
        id: listingId,
        OR: [
          { owner: { userId: session.user.id } },
          ...(session.user.role === "ADMIN" ? [{}] : [])
        ]
      }
    });

    if (!listing) {
      return { success: false, error: "Listing not found or access denied" };
    }

    // Delete listing and all related data (cascade will handle most)
    await prisma.listing.delete({
      where: { id: listingId }
    });

    revalidatePath("/owner");
    revalidatePath("/owner/listings");
    revalidatePath("/admin/listings");

    return { success: true };
  } catch (error) {
    console.error("Error deleting listing:", error);
    return { 
      success: false, 
      error: "Failed to delete listing" 
    };
  }
}

export async function getListingForEdit(listingId: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const listing = await prisma.listing.findFirst({
      where: { 
        id: listingId,
        owner: { userId: session.user.id }
      },
      include: {
        city: true,
        neighborhood: true,
        photos: {
          orderBy: { order: "asc" }
        },
        amenities: {
          include: { amenity: true }
        }
      }
    });

    if (!listing) {
      return { success: false, error: "Listing not found or access denied" };
    }

    return { success: true, listing };
  } catch (error) {
    console.error("Error fetching listing for edit:", error);
    return { 
      success: false, 
      error: "Failed to fetch listing" 
    };
  }
}