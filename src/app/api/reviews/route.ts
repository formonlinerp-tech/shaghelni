import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { createReviewSchema } from '@/lib/validations'
import { calculateTrustScore } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'CLIENT') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createReviewSchema.parse(body)

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: validated.requestId },
      include: { client: true, selectedOffer: { include: { provider: true } }, review: true },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (serviceRequest.client.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    if (serviceRequest.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'لا يمكن التقييم إلا بعد إكمال الطلب' }, { status: 400 })
    }

    if (serviceRequest.review) {
      return NextResponse.json({ success: false, error: 'تم تقييم هذا الطلب مسبقاً' }, { status: 400 })
    }

    const provider = serviceRequest.selectedOffer?.provider
    if (!provider) {
      return NextResponse.json({ success: false, error: 'لا يوجد مقدم خدمة مقبول لهذا الطلب' }, { status: 400 })
    }

    // Create review and update provider stats
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          requestId: validated.requestId,
          reviewerId: session.userId,
          revieweeId: provider.userId,
          rating: validated.rating,
          comment: validated.comment,
        },
      })

      // Update provider stats
      const providerProfile = await tx.providerProfile.findUnique({ where: { id: provider.id } })
      if (providerProfile) {
        const newRatingCount = providerProfile.ratingCount + 1
        const newRatingAvg = ((providerProfile.ratingAvg * providerProfile.ratingCount) + validated.rating) / newRatingCount
        const newCompletedJobs = providerProfile.completedJobs + 1

        await tx.providerProfile.update({
          where: { id: provider.id },
          data: {
            ratingAvg: newRatingAvg,
            ratingCount: newRatingCount,
            completedJobs: newCompletedJobs,
            trustScore: calculateTrustScore({
              ...providerProfile,
              ratingAvg: newRatingAvg,
              completedJobs: newCompletedJobs,
            }),
          },
        })
      }

      // Create transaction for commission
      const commission = Math.round(serviceRequest.budgetMax * 0.05) // 5% commission
      await tx.transaction.create({
        data: {
          requestId: serviceRequest.id,
          providerId: provider.id,
          clientId: serviceRequest.clientId,
          type: 'SERVICE_FEE',
          amount: serviceRequest.budgetMax,
          commission,
          netAmount: serviceRequest.budgetMax - commission,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      // Notify provider
      await tx.notification.create({
        data: {
          userId: provider.userId,
          type: 'REVIEW',
          title: 'تقييم جديد',
          body: `حصلت على تقييم ${validated.rating} نجوم للطلب: ${serviceRequest.title}`,
          data: { requestId: serviceRequest.id, reviewId: newReview.id },
        },
      })

      return newReview
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Create review error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json({ success: false, error: 'معرف مقدم الخدمة مطلوب' }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { name: true, avatar: true } },
        request: { select: { title: true, category: true } },
      },
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get reviews error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}