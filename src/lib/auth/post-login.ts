import type { SupabaseClient, User } from '@supabase/supabase-js'

export type ProfileGate = {
  hasProfile: boolean
  schoolEmailVerified: boolean
}

export function isSchoolEmailVerified(
  profile: { school_email_verified?: boolean | null } | null | undefined,
  user?: User | null
): boolean {
  if (profile?.school_email_verified === true) return true
  const meta = user?.user_metadata as Record<string, unknown> | undefined
  return meta?.school_email_verified === true
}

export async function getProfileGate(
  supabase: SupabaseClient,
  userId: string,
  user?: User | null
): Promise<ProfileGate> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_email_verified')
    .eq('id', userId)
    .maybeSingle()

  return {
    hasProfile: !!profile,
    schoolEmailVerified: isSchoolEmailVerified(profile, user),
  }
}

/** 로그인 직후 이동할 경로 */
export async function resolvePostLoginPath(
  supabase: SupabaseClient,
  userId: string,
  user?: User | null
): Promise<string> {
  const gate = await getProfileGate(supabase, userId, user)
  if (!gate.hasProfile) return '/onboarding'
  if (!gate.schoolEmailVerified) return '/verify-school-email'
  return '/home'
}
