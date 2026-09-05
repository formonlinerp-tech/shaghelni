import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  phone: z.string().regex(/^(\+964|0)?7[0-9]{9}$/, 'رقم هاتف عراقي غير صحيح').optional(),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  role: z.enum(['CLIENT', 'PROVIDER']).default('CLIENT'),
})

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^(\+964|0)?7[0-9]{9}$/, 'رقم هاتف عراقي غير صحيح'),
  otp: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
})

export const requestOtpSchema = z.object({
  phone: z.string().regex(/^(\+964|0)?7[0-9]{9}$/, 'رقم هاتف عراقي غير صحيح'),
})

// Client request schemas
export const createRequestSchema = z.object({
  category: z.nativeEnum({
    ELECTRICIAN: 'ELECTRICIAN',
    PLUMBER: 'PLUMBER',
    AC_REPAIR: 'AC_REPAIR',
    WASHING_MACHINE_REPAIR: 'WASHING_MACHINE_REPAIR',
    PAINTING: 'PAINTING',
    CARPENTRY: 'CARPENTRY',
    WELDING: 'WELDING',
    MOVING: 'MOVING',
    CLEANING: 'CLEANING',
    TUTORING: 'TUTORING',
    DESIGN: 'DESIGN',
    PROGRAMMING: 'PROGRAMMING',
    PHOTOGRAPHY: 'PHOTOGRAPHY',
    MECHANIC: 'MECHANIC',
    PHONE_REPAIR: 'PHONE_REPAIR',
    CAMERA_INSTALLATION: 'CAMERA_INSTALLATION',
    CONSTRUCTION_WORKER: 'CONSTRUCTION_WORKER',
    CAR_MAINTENANCE: 'CAR_MAINTENANCE',
  }),
  title: z.string().min(5, 'العنوان قصير جداً').max(100),
  description: z.string().min(20, 'الوصف قصير جداً').max(2000),
  images: z.array(z.string().url()).max(5).optional(),
  budgetMin: z.number().int().positive('الميزانية الدنيا مطلوبة'),
  budgetMax: z.number().int().positive('الميزانية العليا مطلوبة'),
  urgency: z.enum(['URGENT', 'NORMAL', 'FLEXIBLE']).default('NORMAL'),
  preferredAt: z.string().datetime().optional(),
  address: z.string().min(5, 'العنوان مطلوب').max(200),
  neighborhood: z.string().min(1, 'الحي مطلوب').max(50),
  lat: z.number().min(34).max(37), // Kirkuk bounds approx
  lng: z.number().min(43).max(46),
}).refine(data => data.budgetMax >= data.budgetMin, {
  message: 'الميزانية العليا يجب أن تكون أكبر من أو تساوي الدنيا',
  path: ['budgetMax'],
})

// Provider profile schemas
export const providerProfileSchema = z.object({
  title: z.string().min(3, 'المسمى الوظيفي مطلوب').max(100),
  bio: z.string().max(1000).optional(),
  specialties: z.array(z.nativeEnum({
    ELECTRICIAN: 'ELECTRICIAN',
    PLUMBER: 'PLUMBER',
    AC_REPAIR: 'AC_REPAIR',
    WASHING_MACHINE_REPAIR: 'WASHING_MACHINE_REPAIR',
    PAINTING: 'PAINTING',
    CARPENTRY: 'CARPENTRY',
    WELDING: 'WELDING',
    MOVING: 'MOVING',
    CLEANING: 'CLEANING',
    TUTORING: 'TUTORING',
    DESIGN: 'DESIGN',
    PROGRAMMING: 'PROGRAMMING',
    PHOTOGRAPHY: 'PHOTOGRAPHY',
    MECHANIC: 'MECHANIC',
    PHONE_REPAIR: 'PHONE_REPAIR',
    CAMERA_INSTALLATION: 'CAMERA_INSTALLATION',
    CONSTRUCTION_WORKER: 'CONSTRUCTION_WORKER',
    CAR_MAINTENANCE: 'CAR_MAINTENANCE',
  })).min(1, 'اختر تخصصاً واحداً على الأقل'),
  workAreas: z.array(z.string()).min(1, 'اختر منطقة عمل واحدة على الأقل'),
  priceRangeMin: z.number().int().positive().optional(),
  priceRangeMax: z.number().int().positive().optional(),
  portfolioImages: z.array(z.string().url()).max(10).optional(),
}).refine(data => !data.priceRangeMax || !data.priceRangeMin || data.priceRangeMax >= data.priceRangeMin, {
  message: 'السعر الأعلى يجب أن يكون أكبر من أو يساوي الأدنى',
  path: ['priceRangeMax'],
})

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isActive: z.boolean().default(true),
}).refine(data => data.startTime < data.endTime, {
  message: 'وقت البداية يجب أن يكون قبل وقت النهاية',
  path: ['endTime'],
})

// Offer schemas
export const sendOfferSchema = z.object({
  requestId: z.string().cuid(),
  price: z.number().int().positive('السعر مطلوب'),
  estimatedArrival: z.string().datetime(),
  message: z.string().max(500).optional(),
})

// Review schema
export const createReviewSchema = z.object({
  requestId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// Message schema
export const sendMessageSchema = z.object({
  requestId: z.string().cuid(),
  content: z.string().min(1).max(2000),
  type: z.enum(['TEXT', 'IMAGE']).default('TEXT'),
})

// Subscription schema
export const createSubscriptionSchema = z.object({
  tier: z.enum(['PRO', 'BUSINESS']),
  paymentId: z.string().optional(),
})

// Admin schemas
export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['CLIENT', 'PROVIDER', 'ADMIN']),
})

export const updateProviderVerificationSchema = z.object({
  providerId: z.string().cuid(),
  verification: z.enum(['UNVERIFIED', 'PHONE_VERIFIED', 'ID_VERIFIED']),
})

export const createAdSchema = z.object({
  providerId: z.string().cuid(),
  title: z.string().min(3).max(100),
  description: z.string().max(1000),
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  price: z.number().int().positive(),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>
export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type ProviderProfileInput = z.infer<typeof providerProfileSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
export type SendOfferInput = z.infer<typeof sendOfferSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>