서버용 이메일 존재 확인 API 및 설정 안내

목적
- 최초에 학교 이메일로 가입한 사용자가 이후에도 동일 이메일로 로그인할 수 있게 하며,
- 동일 이메일로 중복 가입이 발생하지 않도록 클라이언트와 서버에서 사전 확인을 수행합니다.

설정
1. `.env.local`에 다음 변수를 추가하세요 (Supabase 프로젝트에서 발급):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key   # 절대 공개하지 마세요!
```

주의: `SUPABASE_SERVICE_ROLE_KEY`는 강력한 권한을 가진 키입니다. 절대 클라이언트에 노출하면 안 되고, 서버 환경에서만 사용하세요.

동작 요약
- 클라이언트(`src/app/login/page.tsx`)에서 이메일로 OTP 발송 전 `/api/auth/check`에 POST 요청하여 해당 이메일로 이미 계정이 존재하는지 확인합니다.
- 존재하면 `supabase.auth.signInWithOtp` 호출 시 `shouldCreateUser: false`로 지정해 기존 계정으로 로그인 시도합니다.
- 존재하지 않으면 `shouldCreateUser: true`로 지정해 신규 계정 생성(가입) 과정을 진행합니다.

서버 엔드포인트
- `POST /api/auth/check` : Body `{ "email": "..." }`로 요청
  - 내부적으로 Supabase Admin API (`/auth/v1/admin/users?email=`)에 서비스 역할 키로 조회하여 결과를 반환합니다.

테스트
- `.env.local`을 설정한 뒤 `npm run dev`로 실행하면 `/api/auth/check`를 통해 계정 존재 여부를 쿼리합니다.

보완사항 (권장)
- 이메일을 통한 중복 계정 문제가 발생하는 워크플로우(예: 소셜 로그인 후 별도 계정 생성)가 있는지 점검하고, 필요하면 소셜 계정 병합(linking) 또는 사용자 안내 흐름을 추가하세요.
- 서비스 역할 키 사용 로그를 남기고, 운영 환경에서만 활성화하세요.
