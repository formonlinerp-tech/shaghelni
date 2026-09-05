import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createTokens, setAuthCookies, verifyPassword } from '@/lib/auth'
import { registerSchema, loginSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          ...(validated.phone ? [{ phone: validated.phone }] : []),
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'المستخدم موجود بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        passwordHash,
        role: validated.role,
      },
      select: { id: true, email: true, name: true, role: true },
    })

    // Create profile based on role
    if (validated.role === 'CLIENT') {
      await prisma.clientProfile.create({
        data: { userId: user.id },
      })
    } else if (validated.role === 'PROVIDER') {
      await prisma.providerProfile.create({
        data: {
          userId: user.id,
          title: '',
          specialties: [],
          workAreas: [],
          portfolioImages: [],
        },
      })
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
      data: { user },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}