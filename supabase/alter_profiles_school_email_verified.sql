-- profiles: 학교 이메일 인증 여부 컬럼 추가
-- Supabase Dashboard → SQL Editor 에서 실행하세요.
-- (온보딩/마이페이지 upsert, auth/check API 가 이 컬럼을 사용합니다.)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_email_verified boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.school_email_verified IS '학교 이메일(@mju.ac.kr) 인증 완료 여부';
