import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/utils'
import { requestOtpSchema } from '@/lib/validations'

// In production, use a proper SMS provider like Twilio, Vonage, or local Iraqi providers
// For now, we'll store OTP in database and log it (development only)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = requestOtpSchema.parse(body)

    const phone = validated.phone.startsWith('+964') ? validated.phone : `+964${validated.phone.replace(/^0/, '')}`
    const otp = generateOTP(6)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database (create a simple OTP table or use SystemSettings)
    // For simplicity, we'll use a JSON field in SystemSettings
    await prisma.systemSettings.upsert({
      where: { key: `otp_${phone}` },
      update: {
        value: { otp, expiresAt: expiresAt.toISOString() },
      },
      create: {
        key: `otp_${phone}`,
        value: { otp, expiresAt: expiresAt.toISOString() },
      },
    })

    // TODO: Send SMS via provider
    console.log(`[DEV] OTP for ${phone}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق',
      // Only in development
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'رقم هاتف غير صحيح' },
        { status: 400 }
      )
    }
    console.error('OTP request error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}