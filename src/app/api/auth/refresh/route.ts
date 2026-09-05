import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyRefreshToken, createTokens, setAuthCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد رمز تحديث' },
        { status: 401 }
      )
    }

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'رمز تحديث غير صالح أو منتهي الصلاحية' },
        { status: 401 }
      )
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, deletedAt: true },
    })

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 401 }
      )
    }

    // Create new tokens
    const { accessToken, refreshToken: newRefreshToken } = await createTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await setAuthCookies(accessToken, newRefreshToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}