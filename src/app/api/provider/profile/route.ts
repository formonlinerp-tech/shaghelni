import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { providerProfileSchema, availabilitySchema } from '@/lib/validations'
import { calculateTrustScore } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    if (session.role !== 'PROVIDER') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: { select: { name: true, email: true, phone: true, phoneVerified: true, avatar: true } },
        availability: true,
        subscriptions: { where: { status: 'ACTIVE' }, take: 1, orderBy: { startedAt: 'desc' } },
        _count: { select: { offers: true } },
      },
    })

    if (!providerProfile) {
      return NextResponse.json({ success: false, error: 'ملف مقدم الخدمة غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: providerProfile })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get provider profile error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'PROVIDER') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const validated = providerProfileSchema.parse(body)

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.userId },
    })

    if (!providerProfile) {
      return NextResponse.json({ success: false, error: 'ملف مقدم الخدمة غير موجود' }, { status: 404 })
    }

    // Calculate trust score after update
    const updatedProfile = await prisma.providerProfile.update({
      where: { userId: session.userId },
      data: {
        ...validated,
        specialties: validated.specialties as any,
        trustScore: calculateTrustScore({
          ...providerProfile,
          ...validated,
          ratingAvg: providerProfile.ratingAvg,
          completedJobs: providerProfile.completedJobs,
          cancelledJobs: providerProfile.cancelledJobs,
          responseTimeAvg: providerProfile.responseTimeAvg,
          verification: providerProfile.verification,
          complaintsCount: providerProfile.complaintsCount,
          createdAt: providerProfile.createdAt,
        }),
      },
    })

    return NextResponse.json({ success: true, data: updatedProfile })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Update provider profile error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}