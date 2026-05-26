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

    const { email } = await req.json()
    if (!email || !String(email).endsWith('@mju.ac.kr')) {
      return NextResponse.json(
        { error: '명지대학교 이메일(@mju.ac.kr)만 사용할 수 있습니다.' },
        { status: 400 }
      )
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

    const { error } = await admin.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
