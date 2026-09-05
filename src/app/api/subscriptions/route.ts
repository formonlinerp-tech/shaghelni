import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { createSubscriptionSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

const TIER_PRICES = {
  PRO: 10000,
  BUSINESS: 25000,
} as const

const TIER_DURATION_DAYS = 30

export async function GET() {
  try {
    const session = await requireAuth()
    if (session.role !== 'PROVIDER') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.userId },
    })

    if (!providerProfile) {
      return NextResponse.json({ success: false, error: 'ملف مقدم الخدمة غير موجود' }, { status: 404 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { providerId: providerProfile.id },
      orderBy: { startedAt: 'desc' },
    })

    const activeSubscription = subscriptions.find(s => s.status === 'ACTIVE' && new Date(s.expiresAt) > new Date())

    return NextResponse.json({ success: true, data: { subscriptions, activeSubscription } })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get subscriptions error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'PROVIDER') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.userId },
    })

    if (!providerProfile) {
      return NextResponse.json({ success: false, error: 'ملف مقدم الخدمة غير موجود' }, { status: 404 })
    }

    const body = await request.json()
    const validated = createSubscriptionSchema.parse(body)

    const price = TIER_PRICES[validated.tier]
    const expiresAt = new Date(Date.now() + TIER_DURATION_DAYS * 24 * 60 * 60 * 1000)

    // In production, integrate with payment gateway (Asia Hawala, Zain Cash, etc.)
    // For MVP, we'll create a mock payment and subscription
    const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const subscription = await prisma.$transaction(async (tx) => {
      // Expire current active subscription
      await tx.subscription.updateMany({
        where: { providerId: providerProfile.id, status: 'ACTIVE' },
        data: { status: 'EXPIRED' },
      })

      // Create new subscription
      const newSubscription = await tx.subscription.create({
        data: {
          userId: session.userId,
          providerId: providerProfile.id,
          tier: validated.tier,
          status: 'ACTIVE',
          expiresAt,
          paymentId: mockPaymentId,
        },
      })

      // Update provider tier
      await tx.providerProfile.update({
        where: { id: providerProfile.id },
        data: { tier: validated.tier },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          providerId: providerProfile.id,
          clientId: session.userId,
          type: 'SUBSCRIPTION',
          amount: price,
          commission: 0,
          netAmount: price,
          status: 'COMPLETED',
          paymentRef: mockPaymentId,
          completedAt: new Date(),
        },
      })

      return newSubscription
    })

    return NextResponse.json({ success: true, data: subscription }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Create subscription error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}