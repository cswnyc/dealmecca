import { z } from "zod";

// Enums matching Prisma schema
export const RoleSchema = z.enum(["GUEST", "OWNER", "ADMIN"]);
export const TierSchema = z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]);
export const ListingStatusSchema = z.enum(["DRAFT", "PENDING", "ACTIVE", "SUSPENDED"]);
export const AvailabilityStatusSchema = z.enum(["AVAILABLE", "BOOKED", "BLOCKED"]);
export const InquiryStatusSchema = z.enum(["PENDING", "RESPONDED", "ARCHIVED"]);

// User schemas
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  role: RoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1).optional(),
  role: RoleSchema.optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: RoleSchema.optional(),
});

// Owner Profile schemas
export const OwnerProfileSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  businessName: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().url().nullable(),
  bio: z.string().nullable(),
  verified: z.boolean(),
  stripeCustomerId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOwnerProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number").optional(),
  website: z.string().url("Invalid website URL").optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
});

export const UpdateOwnerProfileSchema = CreateOwnerProfileSchema.partial();

// City schemas
export const CitySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  slug: z.string().min(1),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCitySchema = z.object({
  name: z.string().min(1, "City name is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Listing schemas
export const ListingSchema = z.object({
  id: z.string().cuid(),
  ownerId: z.string().cuid(),
  cityId: z.string().cuid(),
  neighborhoodId: z.string().cuid().nullable(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  propertyType: z.string(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  maxGuests: z.number().int().min(1),
  basePrice: z.number().int().min(0),
  cleaningFee: z.number().int().min(0).nullable(),
  securityDeposit: z.number().int().min(0).nullable(),
  status: ListingStatusSchema,
  featured: z.boolean(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  icalUrl: z.string().url().nullable(),
  icalSyncedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateListingSchema = z.object({
  cityId: z.string().cuid("Valid city is required"),
  neighborhoodId: z.string().cuid().optional(),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(50, "Description must be at least 50 characters").max(5000, "Description too long"),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or more").max(20, "Too many bedrooms"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or more").max(20, "Too many bathrooms"),
  maxGuests: z.number().int().min(1, "Must accommodate at least 1 guest").max(50, "Too many guests"),
  basePrice: z.number().int().min(100, "Minimum price is $1.00"), // $1.00 in cents
  cleaningFee: z.number().int().min(0).optional(),
  securityDeposit: z.number().int().min(0).optional(),
  metaTitle: z.string().max(60, "Meta title too long").optional(),
  metaDescription: z.string().max(160, "Meta description too long").optional(),
  icalUrl: z.string().url("Invalid iCal URL").optional(),
});

export const UpdateListingSchema = CreateListingSchema.partial();

// Inquiry schemas
export const InquirySchema = z.object({
  id: z.string().cuid(),
  listingId: z.string().cuid(),
  guestId: z.string().cuid().nullable(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().nullable(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().int().min(1),
  message: z.string().nullable(),
  status: InquiryStatusSchema,
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateInquirySchema = z.object({
  listingId: z.string().cuid("Valid listing is required"),
  guestName: z.string().min(1, "Name is required").max(100, "Name too long"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number").optional(),
  checkIn: z.date().refine(
    (date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return date >= tomorrow;
    },
    "Check-in must be at least tomorrow"
  ),
  checkOut: z.date(),
  guests: z.number().int().min(1, "Must have at least 1 guest").max(50, "Too many guests"),
  message: z.string().max(1000, "Message too long").optional(),
}).refine(
  (data) => {
    const diffTime = data.checkOut.getTime() - data.checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  },
  {
    message: "Check-out must be at least 1 day after check-in",
    path: ["checkOut"],
  }
);

// Search schemas
export const SearchListingsSchema = z.object({
  query: z.string().optional(),
  citySlug: z.string().optional(),
  neighborhoodSlug: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  maxGuests: z.number().int().min(1).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  propertyType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  featured: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["price", "rating", "created", "featured"]).default("featured"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Subscription schemas
export const SubscriptionSchema = z.object({
  id: z.string().cuid(),
  ownerId: z.string().cuid(),
  stripeSubscriptionId: z.string().nullable(),
  tier: TierSchema,
  status: z.string(),
  currentPeriodStart: z.date().nullable(),
  currentPeriodEnd: z.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  maxListings: z.number().int().min(0),
  featuredListings: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Availability schemas
export const AvailabilitySchema = z.object({
  id: z.string().cuid(),
  listingId: z.string().cuid(),
  date: z.date(),
  status: AvailabilityStatusSchema,
  price: z.number().int().min(0).nullable(),
  minStay: z.number().int().min(1).nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAvailabilitySchema = z.object({
  listingId: z.string().cuid("Valid listing is required"),
  date: z.date(),
  status: AvailabilityStatusSchema.default("AVAILABLE"),
  price: z.number().int().min(0).optional(),
  minStay: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
});

// Review schemas
export const ReviewSchema = z.object({
  id: z.string().cuid(),
  listingId: z.string().cuid(),
  guestId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  approved: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateReviewSchema = z.object({
  listingId: z.string().cuid("Valid listing is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment too long").optional(),
});

// SEO Page schemas
export const SeoPageSchema = z.object({
  id: z.string().cuid(),
  path: z.string().min(1),
  title: z.string().min(1),
  metaDescription: z.string().min(1),
  h1: z.string().min(1),
  content: z.string().min(1),
  citySlug: z.string().nullable(),
  neighborhoodSlug: z.string().nullable(),
  bedrooms: z.number().int().nullable(),
  amenities: z.array(z.string()),
  views: z.number().int().min(0),
  lastViewed: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateSeoPageSchema = z.object({
  path: z.string().min(1, "Path is required"),
  title: z.string().min(1, "Title is required").max(60, "Title too long"),
  metaDescription: z.string().min(1, "Meta description is required").max(160, "Meta description too long"),
  h1: z.string().min(1, "H1 is required"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  citySlug: z.string().optional(),
  neighborhoodSlug: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  amenities: z.array(z.string()).optional(),
});

// Type exports
export type Role = z.infer<typeof RoleSchema>;
export type Tier = z.infer<typeof TierSchema>;
export type ListingStatus = z.infer<typeof ListingStatusSchema>;
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
export type InquiryStatus = z.infer<typeof InquiryStatusSchema>;

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type OwnerProfile = z.infer<typeof OwnerProfileSchema>;
export type CreateOwnerProfile = z.infer<typeof CreateOwnerProfileSchema>;
export type UpdateOwnerProfile = z.infer<typeof UpdateOwnerProfileSchema>;

export type City = z.infer<typeof CitySchema>;
export type CreateCity = z.infer<typeof CreateCitySchema>;

export type Listing = z.infer<typeof ListingSchema>;
export type CreateListing = z.infer<typeof CreateListingSchema>;
export type UpdateListing = z.infer<typeof UpdateListingSchema>;

export type Inquiry = z.infer<typeof InquirySchema>;
export type CreateInquiry = z.infer<typeof CreateInquirySchema>;

export type SearchListings = z.infer<typeof SearchListingsSchema>;

export type Subscription = z.infer<typeof SubscriptionSchema>;

export type Availability = z.infer<typeof AvailabilitySchema>;
export type CreateAvailability = z.infer<typeof CreateAvailabilitySchema>;

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;

export type SeoPage = z.infer<typeof SeoPageSchema>;
export type CreateSeoPage = z.infer<typeof CreateSeoPageSchema>;