import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { availabilitySchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

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

    const availability = await prisma.availability.findMany({
      where: { providerId: providerProfile.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return NextResponse.json({ success: true, data: availability })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get availability error:', error)
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
    const validated = availabilitySchema.parse(body)

    const availability = await prisma.availability.upsert({
      where: { providerId_dayOfWeek: { providerId: providerProfile.id, dayOfWeek: validated.dayOfWeek } },
      update: validated,
      create: { ...validated, providerId: providerProfile.id },
    })

    return NextResponse.json({ success: true, data: availability })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة', details: error }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Create availability error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}