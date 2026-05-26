import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyOtpWithFallback(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  token: string
) {
  let result = await admin.auth.verifyOtp({ email, token, type: 'email' })
  if (result.error?.message?.includes('expired') || result.error?.message?.includes('invalid')) {
    result = await admin.auth.verifyOtp({ email, token, type: 'signup' })
  }
  if (result.error?.message?.includes('expired') || result.error?.message?.includes('invalid')) {
    result = await admin.auth.verifyOtp({ email, token, type: 'magiclink' })
  }
  return result
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { email, code } = await req.json()
    if (!email || !String(email).endsWith('@mju.ac.kr')) {
      return NextResponse.json({ error: '유효한 학교 이메일이 필요합니다.' }, { status: 400 })
    }
    if (!code || String(code).length < 6) {
      return NextResponse.json({ error: '인증번호를 입력해주세요.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: duplicate } = await admin
      .from('profiles')
      .select('id')
      .eq('school_email', email)
      .eq('school_email_verified', true)
      .neq('id', user.id)
      .maybeSingle()

    if (duplicate) {
      return NextResponse.json(
        { error: '이미 다른 계정에서 인증된 학교 이메일입니다.' },
        { status: 409 }
      )
    }

    const { data: otpData, error: otpError } = await verifyOtpWithFallback(
      admin,
      email,
      String(code)
    )

    if (otpError) {
      return NextResponse.json({ error: otpError.message }, { status: 400 })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: '프로필을 먼저 설정해주세요.', redirect: '/onboarding' },
        { status: 400 }
      )
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        school_email: email,
        school_email_verified: true,
      })
      .eq('id', user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata ?? {}),
        school_email: email,
        school_email_verified: true,
      },
    })

    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 })
    }

    // OTP 검증용으로 잠깐 생성된 이메일 전용 auth 유저 정리 (구글 계정과 다른 경우)
    if (otpData.user && otpData.user.id !== user.id) {
      await admin.auth.admin.deleteUser(otpData.user.id).catch(() => {})
    }

    return NextResponse.json({ success: true, redirect: '/home' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
