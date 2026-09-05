import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { sendOfferSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

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

    if (!providerProfile.isActive) {
      return NextResponse.json({ success: false, error: 'حسابك معطل' }, { status: 403 })
    }

    // Check subscription limits for FREE tier
    if (providerProfile.tier === 'FREE') {
      const currentMonthStart = new Date()
      currentMonthStart.setDate(1)
      currentMonthStart.setHours(0, 0, 0, 0)

      const offersThisMonth = await prisma.offer.count({
        where: {
          providerId: providerProfile.id,
          createdAt: { gte: currentMonthStart },
        },
      })

      if (offersThisMonth >= 5) {
        return NextResponse.json(
          { success: false, error: 'لقد وصلت للحد الأقصى للعروض الشهرية (5). قم بالترقية لـ Pro للحصول على عروض غير محدودة.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validated = sendOfferSchema.parse(body)

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: validated.requestId },
      include: { client: true },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (serviceRequest.status !== 'PENDING' && serviceRequest.status !== 'OFFERS_RECEIVED') {
      return NextResponse.json({ success: false, error: 'الطلب غير متاح للعروض' }, { status: 400 })
    }

    // Check if already offered
    const existingOffer = await prisma.offer.findFirst({
      where: { requestId: validated.requestId, providerId: providerProfile.id },
    })

    if (existingOffer) {
      return NextResponse.json({ success: false, error: 'لقد أرسلت عرضاً لهذا الطلب مسبقاً' }, { status: 400 })
    }

    // Validate price within budget
    if (validated.price < serviceRequest.budgetMin || validated.price > serviceRequest.budgetMax) {
      return NextResponse.json(
        { success: false, error: `السعر يجب أن يكون بين ${serviceRequest.budgetMin} و ${serviceRequest.budgetMax} دينار` },
        { status: 400 }
      )
    }

    const offer = await prisma.$transaction(async (tx) => {
      const newOffer = await tx.offer.create({
        data: {
          requestId: validated.requestId,
          providerId: providerProfile.id,
          price: validated.price,
          estimatedArrival: new Date(validated.estimatedArrival),
          message: validated.message,
        },
      })

      // Update request status
      await tx.serviceRequest.update({
        where: { id: validated.requestId },
        data: { status: 'OFFERS_RECEIVED' },
      })

      // Notify client
      await tx.notification.create({
        data: {
          userId: serviceRequest.client.userId,
          type: 'NEW_OFFER',
          title: 'وصل عرض جديد',
          body: `تلقيت عرضاً بقيمة ${validated.price.toLocaleString()} دينار للطلب: ${serviceRequest.title}`,
          data: { requestId: validated.requestId, offerId: newOffer.id },
        },
      })

      return newOffer
    })

    return NextResponse.json({ success: true, data: offer }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Send offer error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { providerId: providerProfile.id }
    if (status) where.status = status

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          request: {
            select: {
              id: true,
              title: true,
              category: true,
              address: true,
              lat: true,
              lng: true,
              status: true,
              client: { select: { user: { select: { name: true, avatar: true, phone: true } } } },
            },
          },
        },
      }),
      prisma.offer.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: offers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get offers error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}