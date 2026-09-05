import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('ar-IQ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return formatDate(date)
}

export function generateOTP(length = 6): string {
  return Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)).toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const KIRKUK_NEIGHBORHOODS = [
  'الوَاسِطِي',
  'المُجَرَّد',
  'الْعَرَبِي',
  'الْكُورْدِي',
  'التُّرْكُمَانِي',
  'الرَّحِيمَاوِي',
  'الْقَادِسِيَّة',
  'الْأَنْصَار',
  'الْحُرِّيَّة',
  'الْعُرُوبَة',
  'النِّصْر',
  'الشَّهَادَة',
  'الْيَرْمُوك',
  'الْعَرُوس',
  'الْوَحْدَة',
  'الْجُمْهُورِيَّة',
  'الْإِسْكَان',
  'الْأَثِير',
  'الرَّاشِد',
  'الْمَعْلَم',
  'أَخْرَى',
] as const

export type KirkukNeighborhood = (typeof KIRKUK_NEIGHBORHOODS)[number]

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  ELECTRICIAN: 'كهربائي',
  PLUMBER: 'سباك',
  AC_REPAIR: 'تصليح مكيف',
  WASHING_MACHINE_REPAIR: 'تصليح غسالة',
  PAINTING: 'صبغ بيت',
  CARPENTRY: 'نجار',
  WELDING: 'حداد',
  MOVING: 'نقل أثاث',
  CLEANING: 'تنظيف منزل',
  TUTORING: 'مدرس خصوصي',
  DESIGN: 'مصمم',
  PROGRAMMING: 'مبرمج',
  PHOTOGRAPHY: 'مصور',
  MECHANIC: 'ميكانيكي',
  PHONE_REPAIR: 'تصليح موبايل',
  CAMERA_INSTALLATION: 'تركيب كاميرات',
  CONSTRUCTION_WORKER: 'عامل بناء',
  CAR_MAINTENANCE: 'صيانة سيارات',
}

export const URGENCY_LABELS: Record<string, string> = {
  URGENT: 'عاجل (خلال ساعة)',
  NORMAL: 'اليوم',
  FLEXIBLE: 'خلال أيام',
}

export const PROVIDER_TIER_LABELS: Record<string, string> = {
  FREE: 'مجاني',
  PRO: 'احترافي',
  BUSINESS: 'أعمال',
}

export const PROVIDER_TIER_FEATURES = {
  FREE: {
    monthlyOffers: 5,
    searchRanking: 'normal',
    badge: null,
    analytics: false,
    directRequests: false,
  },
  PRO: {
    monthlyOffers: Infinity,
    searchRanking: 'boosted',
    badge: 'PRO',
    analytics: true,
    directRequests: false,
  },
  BUSINESS: {
    monthlyOffers: Infinity,
    searchRanking: 'top',
    badge: 'BUSINESS',
    analytics: true,
    directRequests: true,
  },
}

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function toRad(deg: number): number {
  return deg * Math.PI / 180
}

export function calculateTrustScore(provider: {
  ratingAvg: number
  completedJobs: number
  cancelledJobs: number
  responseTimeAvg: number
  verification: string
  complaintsCount: number
  createdAt: Date
}): number {
  const weights = {
    ratingWeight: 0.30,
    completionRateWeight: 0.25,
    responseTimeWeight: 0.15,
    tenureWeight: 0.10,
    verificationWeight: 0.10,
    complaintWeight: 0.10,
  }

  const ratingScore = (provider.ratingAvg / 5) * 30
  const totalJobs = provider.completedJobs + provider.cancelledJobs
  const completionScore = totalJobs > 0
    ? (provider.completedJobs / totalJobs) * 25
    : 0
  const responseScore = provider.responseTimeAvg > 0
    ? Math.max(0, 15 - (provider.responseTimeAvg / 60) * 5)
    : 7.5
  const tenureMonths = Math.min(24, (Date.now() - new Date(provider.createdAt).getTime()) / (1000*60*60*24*30))
  const tenureScore = (tenureMonths / 24) * 10
  const verificationScore = provider.verification === 'ID_VERIFIED' ? 10
    : provider.verification === 'PHONE_VERIFIED' ? 5 : 0
  const complaintScore = Math.max(0, 10 - provider.complaintsCount * 2)

  return Math.round(
    ratingScore + completionScore + responseScore + tenureScore + verificationScore + complaintScore
  )
}