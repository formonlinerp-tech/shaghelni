import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { sendMessageSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await requireAuth()
    const { requestId } = await params

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        client: true,
        selectedOffer: { include: { provider: { include: { user: true } } } },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    const isClient = serviceRequest.client.userId === session.userId
    const isProvider = serviceRequest.selectedOffer?.provider.userId === session.userId
    const isAdmin = session.role === 'ADMIN'

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Mark as read
    await prisma.message.updateMany({
      where: { requestId, receiverId: session.userId, readAt: null },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get messages error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await requireAuth()
    const { requestId } = await params

    const body = await request.json()
    const validated = sendMessageSchema.parse(body)

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        client: true,
        selectedOffer: { include: { provider: { include: { user: true } } } },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 })
    }

    const isClient = serviceRequest.client.userId === session.userId
    const isProvider = serviceRequest.selectedOffer?.provider.userId === session.userId
    const isAdmin = session.role === 'ADMIN'

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const receiverId = isClient ? serviceRequest.selectedOffer?.provider.userId : serviceRequest.client.userId
    if (!receiverId && !isAdmin) {
      return NextResponse.json({ success: false, error: 'لا يمكن إرسال رسالة - لا يوجد مستلم' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        requestId,
        senderId: session.userId,
        receiverId: receiverId || session.userId,
        content: validated.content,
        type: validated.type,
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })

    // Notify receiver
    if (receiverId && receiverId !== session.userId) {
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE',
          title: 'رسالة جديدة',
          body: `رسالة جديدة من ${session.userId}: ${validated.content.substring(0, 50)}...`,
          data: { requestId, messageId: message.id },
        },
      })
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Send message error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}