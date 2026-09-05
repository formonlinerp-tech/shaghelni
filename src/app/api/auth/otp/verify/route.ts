import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPhoneSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = verifyPhoneSchema.parse(body)

    const phone = validated.phone.startsWith('+964') ? validated.phone : `+964${validated.phone.replace(/^0/, '')}`

    const setting = await prisma.systemSettings.findUnique({
      where: { key: `otp_${phone}` },
    })

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'رمز التحقق منتهي الصلاحية أو غير موجود' },
        { status: 400 }
      )
    }

    const { otp, expiresAt } = setting.value as { otp: string; expiresAt: string }

    if (new Date() > new Date(expiresAt)) {
      await prisma.systemSettings.delete({ where: { key: `otp_${phone}` } })
      return NextResponse.json(
        { success: false, error: 'رمز التحقق منتهي الصلاحية' },
        { status: 400 }
      )
    }

    if (otp !== validated.otp) {
      return NextResponse.json(
        { success: false, error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      )
    }

    // Mark phone as verified for the user
    const user = await prisma.user.findUnique({ where: { phone } })
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      })
    }

    // Clean up OTP
    await prisma.systemSettings.delete({ where: { key: `otp_${phone}` } })

    return NextResponse.json({
      success: true,
      message: 'تم التحقق من رقم الهاتف بنجاح',
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}