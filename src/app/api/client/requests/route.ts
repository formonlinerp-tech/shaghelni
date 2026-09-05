import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { createRequestSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'CLIENT') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
    })

    if (!clientProfile) {
      return NextResponse.json({ success: false, error: 'الملف الشخصي غير موجود' }, { status: 404 })
    }

    const where: any = { clientId: clientProfile.id }
    if (status) where.status = status

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          offers: {
            where: { status: { in: ['PENDING', 'ACCEPTED'] } },
            include: {
              provider: {
                select: {
                  id: true,
                  title: true,
                  ratingAvg: true,
                  trustScore: true,
                  verification: true,
                  user: { select: { name: true, avatar: true } },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          review: true,
          _count: { select: { offers: true } },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get requests error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'CLIENT') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createRequestSchema.parse(body)

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
    })

    if (!clientProfile) {
      return NextResponse.json({ success: false, error: 'الملف الشخصي غير موجود' }, { status: 404 })
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        clientId: clientProfile.id,
        category: validated.category as any,
        title: validated.title,
        description: validated.description,
        images: validated.images || [],
        budgetMin: validated.budgetMin,
        budgetMax: validated.budgetMax,
        urgency: validated.urgency,
        preferredAt: validated.preferredAt ? new Date(validated.preferredAt) : null,
        address: validated.address,
        lat: validated.lat,
        lng: validated.lng,
      },
    })

    // Notify nearby providers (in background)
    // TODO: Implement notification system

    return NextResponse.json({ success: true, data: serviceRequest }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Create request error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}