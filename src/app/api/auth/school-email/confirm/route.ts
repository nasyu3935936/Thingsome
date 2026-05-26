import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyOtpWithFallback(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  token: string
) {
  const types = ['email', 'signup', 'magiclink'] as const
  let lastError: { message: string } | null = null

  for (const type of types) {
    const result = await admin.auth.verifyOtp({ email, token, type })
    if (!result.error) return result
    lastError = result.error
    const msg = result.error.message.toLowerCase()
    if (!msg.includes('expired') && !msg.includes('invalid') && !msg.includes('token')) {
      break
    }
  }

  return { data: { user: null, session: null }, error: lastError }
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

    let body: { email?: string; code?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: '요청 본문이 올바르지 않습니다.' }, { status: 400 })
    }

    const email = body.email?.trim().toLowerCase()
    const code = body.code?.trim()

    if (!email || !email.endsWith('@mju.ac.kr')) {
      return NextResponse.json({ error: '유효한 학교 이메일이 필요합니다.' }, { status: 400 })
    }
    if (!code || code.length < 6) {
      return NextResponse.json({ error: '인증번호 6자리 이상을 입력해주세요.' }, { status: 400 })
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: '서버 설정(SUPABASE_SERVICE_ROLE_KEY)이 없습니다.' },
        { status: 500 }
      )
    }

    const { data: otpData, error: otpError } = await verifyOtpWithFallback(admin, email, code)

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

    const profileUpdate: Record<string, unknown> = {
      school_email_verified: true,
    }
    profileUpdate.school_email = email

    const { error: profileError } = await admin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)

    if (profileError) {
      if (profileError.message.includes('school_email')) {
        const { error: fallbackError } = await admin
          .from('profiles')
          .update({ school_email_verified: true })
          .eq('id', user.id)
        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
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

    if (otpData?.user && otpData.user.id !== user.id) {
      await admin.auth.admin.deleteUser(otpData.user.id).catch(() => {})
    }

    return NextResponse.json({ success: true, redirect: '/home' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[school-email/confirm]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
