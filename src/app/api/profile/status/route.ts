import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSchoolEmailVerified } from '@/lib/auth/post-login'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const onboardingCompleted = meta.onboarding_completed === true

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('id, school_email_verified, school_email, nickname')
      .eq('id', user.id)
      .maybeSingle()

    const hasProfile = !!profile || onboardingCompleted
    const schoolEmailVerified = isSchoolEmailVerified(profile, user)

    let redirect = '/onboarding'
    if (hasProfile && !schoolEmailVerified) redirect = '/verify-school-email'
    if (hasProfile && schoolEmailVerified) redirect = '/home'

    return NextResponse.json({
      authenticated: true,
      hasProfile,
      schoolEmailVerified,
      onboardingCompleted,
      redirect,
      profile: profile
        ? {
            nickname: profile.nickname,
            school_email: profile.school_email,
          }
        : null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
