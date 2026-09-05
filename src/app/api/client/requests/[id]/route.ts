import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: { select: { user: { select: { id: true, name: true, avatar: true, phone: true } } } },
        offers: {
          include: {
            provider: {
              select: {
                id: true,
                title: true,
                bio: true,
                ratingAvg: true,
                trustScore: true,
                verification: true,
                portfolioImages: true,
                user: { select: { id: true, name: true, avatar: true, phone: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        review: true,
        messages: {
          include: { sender: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Check authorization
    const isClient = serviceRequest.client.user.id === session.userId
    const isProvider = serviceRequest.offers.some(o => o.provider.user.id === session.userId)
    const isAdmin = session.role === 'ADMIN'

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    // Hide phone numbers unless authorized
    const sanitized = {
      ...serviceRequest,
      client: { ...serviceRequest.client, user: { ...serviceRequest.client.user, phone: isClient || isAdmin ? serviceRequest.client.user.phone : undefined } },
      offers: serviceRequest.offers.map(o => ({
        ...o,
        provider: { ...o.provider, user: { ...o.provider.user, phone: isClient || isAdmin ? o.provider.user.phone : undefined } },
      })),
    }

    return NextResponse.json({ success: true, data: sanitized })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get request error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const body = await request.json()

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: { client: true },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Only client can update their request (before offers)
    if (serviceRequest.client.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    // Only allow certain updates
    const allowedFields = ['title', 'description', 'budgetMin', 'budgetMax', 'urgency', 'preferredAt', 'address', 'lat', 'lng']
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'preferredAt' && body[field] ? new Date(body[field]) : body[field]
      }
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Update request error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}