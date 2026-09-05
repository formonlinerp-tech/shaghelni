import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: true, data: null })
    }

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        createdAt: true,
        clientProfile: {
          select: { id: true, address: true, lat: true, lng: true },
        },
        providerProfile: {
          select: {
            id: true,
            title: true,
            bio: true,
            specialties: true,
            workAreas: true,
            priceRangeMin: true,
            priceRangeMax: true,
            portfolioImages: true,
            tier: true,
            trustScore: true,
            verification: true,
            ratingAvg: true,
            ratingCount: true,
            isActive: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json({ success: true, data: { user, session } })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ success: true, data: null })
  }
}