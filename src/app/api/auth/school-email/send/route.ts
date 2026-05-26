import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    let body: { email?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: '요청 본문이 올바르지 않습니다.' }, { status: 400 })
    }

    const email = body.email?.trim().toLowerCase()
    if (!email || !email.endsWith('@mju.ac.kr')) {
      return NextResponse.json(
        { error: '명지대학교 이메일(@mju.ac.kr)만 사용할 수 있습니다.' },
        { status: 400 }
      )
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { error: '서버 설정(SUPABASE_SERVICE_ROLE_KEY)이 없습니다. Vercel 환경변수를 확인해주세요.' },
        { status: 500 }
      )
    }

    const { data: duplicate, error: dupError } = await admin
      .from('profiles')
      .select('id')
      .eq('school_email', email)
      .eq('school_email_verified', true)
      .neq('id', user.id)
      .maybeSingle()

    if (dupError && !dupError.message.includes('school_email')) {
      console.error('[school-email/send] duplicate check:', dupError.message)
    } else if (duplicate) {
      return NextResponse.json(
        { error: '이미 다른 계정에서 인증된 학교 이메일입니다.' },
        { status: 409 }
      )
    }

    const { error } = await admin.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          linked_google_user_id: user.id,
          purpose: 'school_email_verification',
        },
      },
    })

    if (error) {
      console.error('[school-email/send] signInWithOtp:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '인증번호가 발송되었습니다.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[school-email/send]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
