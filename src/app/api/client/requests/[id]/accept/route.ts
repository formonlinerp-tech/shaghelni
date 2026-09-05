import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'CLIENT') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const offerId = body.offerId

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: true,
        offers: {
          where: { id: offerId },
          include: { provider: { include: { user: true } } },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (serviceRequest.client.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    if (serviceRequest.status !== 'PENDING' && serviceRequest.status !== 'OFFERS_RECEIVED') {
      return NextResponse.json({ success: false, error: 'لا يمكن قبول عرض في هذه الحالة' }, { status: 400 })
    }

    const offer = serviceRequest.offers.find(o => o.id === offerId)
    if (!offer) {
      return NextResponse.json({ success: false, error: 'العرض غير موجود' }, { status: 404 })
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'العرض غير متاح' }, { status: 400 })
    }

    // Accept offer and reject others
    await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      })

      await tx.offer.updateMany({
        where: { requestId: id, id: { not: offerId }, status: 'PENDING' },
        data: { status: 'REJECTED', rejectedAt: new Date() },
      })

      await tx.serviceRequest.update({
        where: { id },
        data: { status: 'ACCEPTED', selectedOfferId: offerId },
      })

      // Create notification for provider
      await tx.notification.create({
        data: {
          userId: offer.provider.userId,
          type: 'OFFER_ACCEPTED',
          title: 'تم قبول عرضك',
          body: `تم قبول عرضك للطلب: ${serviceRequest.title}`,
          data: { requestId: id, offerId },
        },
      })
    })

    return NextResponse.json({ success: true, message: 'تم قبول العرض بنجاح' })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Accept offer error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}