import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { haversineDistance } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '10')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {
      status: 'PENDING',
      category: { in: providerProfile.specialties },
    }

    if (category) where.category = category

    const requests = await prisma.serviceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Fetch more for distance filtering
      include: {
        client: { select: { user: { select: { name: true, avatar: true } } } },
        _count: { select: { offers: true } },
      },
    })

    // Filter by distance and work areas
    const filtered = requests
      .map(req => ({
        ...req,
        distance: haversineDistance(lat, lng, req.lat, req.lng),
      }))
      .filter(req => {
        if (req.distance > radius) return false
        if (providerProfile.workAreas.length > 0) {
          // Check if request address matches any work area
          // For simplicity, we'll just check distance
          return true
        }
        return true
      })
      .sort((a, b) => a.distance - b.distance)
      .slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: { page, limit, total: filtered.length },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Get nearby requests error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}