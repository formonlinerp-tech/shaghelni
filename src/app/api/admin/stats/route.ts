import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalUsers,
      totalClients,
      totalProviders,
      totalRequests,
      totalOffers,
      totalReviews,
      totalTransactions,
      monthlyRevenue,
      pendingVerifications,
      activeDisputes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.serviceRequest.count(),
      prisma.offer.count(),
      prisma.review.count(),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: thisMonthStart }, status: 'COMPLETED' },
        _sum: { commission: true, amount: true },
      }),
      prisma.providerProfile.count({ where: { verification: 'UNVERIFIED', isActive: true } }),
      prisma.serviceRequest.count({ where: { status: 'DISPUTED' } }),
    ])

    const lastMonthRevenue = await prisma.transaction.aggregate({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: 'COMPLETED' },
      _sum: { commission: true },
    })

    const requestsByStatus = await prisma.serviceRequest.groupBy({
      by: ['status'],
      _count: true,
    })

    const requestsByCategory = await prisma.serviceRequest.groupBy({
      by: ['category'],
      _count: true,
    })

    const providersByTier = await prisma.providerProfile.groupBy({
      by: ['tier'],
      _count: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalClients,
          totalProviders,
          totalRequests,
          totalOffers,
          totalReviews,
          totalTransactions,
          monthlyRevenue: monthlyRevenue._sum.commission || 0,
          monthlyRevenueGrowth: lastMonthRevenue._sum.commission
            ? ((monthlyRevenue._sum.commission || 0) - (lastMonthRevenue._sum.commission || 0)) / (lastMonthRevenue._sum.commission || 1) * 100
            : 0,
          pendingVerifications,
          activeDisputes,
        },
        requestsByStatus: requestsByStatus.map(r => ({ status: r.status, count: r._count })),
        requestsByCategory: requestsByCategory.map(r => ({ category: r.category, count: r._count })),
        providersByTier: providersByTier.map(p => ({ tier: p.tier, count: p._count })),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }
    console.error('Admin stats error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}