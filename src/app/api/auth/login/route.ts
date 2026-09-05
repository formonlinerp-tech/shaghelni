import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createTokens, setAuthCookies } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true, email: true, name: true, role: true, passwordHash: true, deletedAt: true },
    })

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(validated.password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    // Create tokens
    const { accessToken, refreshToken } = await createTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookies
    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}