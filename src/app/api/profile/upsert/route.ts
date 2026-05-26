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

    const body = await req.json()
    const {
      nickname,
      major,
      student_id,
      gender,
      age,
      bio,
      tags,
      preferred_age_min,
      preferred_age_max,
    } = body

    if (!nickname) {
      return NextResponse.json({ error: '닉네임은 필수입니다.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.id,
      nickname,
      major,
      student_id,
      gender,
      age: typeof age === 'number' ? age : parseInt(String(age), 10),
      bio,
      tags,
      preferred_age_min,
      preferred_age_max,
      school_email_verified: false,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata ?? {}),
        onboarding_completed: true,
        school_email_verified: false,
      },
    })

    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirect: '/verify-school-email' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
