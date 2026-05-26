-- profiles: 학교 이메일 주소 저장
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_email text;

COMMENT ON COLUMN public.profiles.school_email IS '인증 완료된 명지대 학교 이메일 (@mju.ac.kr)';
