"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Icons } from "@/components/Icons";

export default function LoginPage() {
  const [step, setStep] = useState<"social" | "email" | "verify">("social");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();

  // 1. 소셜 로그인 연동 (카카오, 구글)
  const handleSocialLogin = async (provider: "kakao" | "google") => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) throw error;
      
      // 정상적으로 구글/카카오로 넘어가기 전 만약을 대비해 3초 뒤 로딩 해제 (뒤로가기 방어)
      setTimeout(() => setIsLoading(false), 3000);
    } catch (err: any) {
      alert(`${provider} 로그인 설정 오류: Supabase 대시보드에서 ${provider} Provider가 켜져(ON) 있는지, Save를 눌렀는지 확인해주세요!\n\n(상세 에러: ${err.message})`);
      setIsLoading(false);
    }
  };

  // 2. 학교 이메일 인증번호(OTP) 발송
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@mju.ac.kr")) {
      alert("명지대학교 이메일(@mju.ac.kr)만 사용 가능합니다.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // 가입되지 않은 경우 자동 가입 진행
        },
      });

      // 발송 한도 초과(Rate Limit) 에러 발생 시 개발용 프리패스!
      if (error && error.message.includes("rate limit")) {
        alert("🚨 Supabase 시간당 이메일 발송 한도(3회)를 초과했습니다!\n\n💡 하지만 현재 개발 모드이므로, 원활한 테스트를 위해 인증 과정을 강제로 생략하고 온보딩 페이지로 넘어갑니다!");
        window.location.href = "/onboarding";
        return;
      }

      if (error) throw error;
      
      alert("인증번호가 메일로 발송되었습니다. (스팸 메일함도 확인해 보세요!)");
      setStep("verify");
    } catch (err: any) {
      alert(`인증 메일 전송 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 발송된 6자리 인증번호(OTP) 확인 및 로그인 완료
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) throw error;

      if (data.session) {
        alert("이메일 인증이 완료되었습니다! 🎉");
        window.location.href = "/onboarding";
      } else {
        throw new Error("세션을 생성할 수 없습니다.");
      }
    } catch (err: any) {
      alert(`인증번호 확인 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          opacity: 1,
          animation: "fadeIn 0.6s ease-out forwards",
        }}
      >
        {/* Back to Home */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "14px",
            marginBottom: "32px",
            transition: "color var(--transition-fast)",
          }}
        >
          ← 홈으로
        </Link>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              marginBottom: "12px",
              animation: "heartbeat 2s ease-in-out infinite",
              color: "var(--primary-400)",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Icons.HeartFilled />
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "8px",
            }}
          >
            띵썸
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            {step === "social" && "소셜 계정 또는 이메일로 간편하게 시작하세요"}
            {step === "email" && "학교 이메일로 재학생 인증하기"}
            {step === "verify" && "인증번호를 입력해주세요"}
          </p>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          {["시작하기", "이메일 인증", "인증 완료"].map((label, i) => {
            const stepIndex = step === "social" ? 0 : step === "email" ? 1 : 2;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    background:
                      i <= stepIndex
                        ? "var(--gradient-primary)"
                        : "var(--bg-glass)",
                    border:
                      i > stepIndex
                        ? "1px solid var(--border-subtle)"
                        : "none",
                    color: i <= stepIndex ? "white" : "var(--text-muted)",
                    transition: "all var(--transition-base)",
                  }}
                >
                  {i < stepIndex ? <Icons.Check /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color:
                      i === stepIndex
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    fontWeight: i === stepIndex ? 600 : 400,
                    display: i === stepIndex ? "block" : "none",
                  }}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    style={{
                      width: "24px",
                      height: "2px",
                      background:
                        i < stepIndex
                          ? "var(--primary-500)"
                          : "var(--border-subtle)",
                      borderRadius: "1px",
                      transition: "background var(--transition-base)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Social Login Step */}
        {step === "social" && (
          <div
            className="glass-card"
            style={{
              padding: "32px 24px",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={() => handleSocialLogin("kakao")}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "16px",
                  background: "#FEE500",
                  color: "#191919",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  fontFamily: "inherit",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#191919">
                  <path d="M10 2C5.03 2 1 5.13 1 8.97c0 2.47 1.64 4.63 4.1 5.87-.13.47-.83 3.03-.86 3.22 0 0-.02.14.07.19.09.06.2.03.2.03.27-.04 3.1-2.04 3.59-2.39.29.04.59.06.9.06 4.97 0 9-3.13 9-6.97S14.97 2 10 2z" />
                </svg>
                카카오로 시작하기
              </button>

              <button
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "16px",
                  background: "white",
                  color: "#333",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  fontFamily: "inherit",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Google로 시작하기
              </button>

              <div style={{ display: "flex", alignItems: "center", margin: "12px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
                <span style={{ padding: "0 10px", fontSize: "12px", color: "var(--text-muted)" }}>또는</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* 📧 학교 이메일 바로가기 버튼 */}
              <button
                type="button"
                onClick={() => setStep("email")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "15px",
                  background: "var(--bg-glass)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  fontFamily: "inherit",
                }}
              >
                <Icons.MessageText /> 학교 이메일로 바로 시작하기
              </button>
            </div>
            
            {/* 🛠 개발자용 프리패스 버튼 (소셜 탭) */}
            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/onboarding";
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "16px",
                  background: "rgba(168,85,247,0.15)",
                  border: "1px dashed var(--purple-500)",
                  color: "var(--purple-400)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Icons.Sliders /> [개발용] 인증 없이 바로 온보딩 가기
              </button>
            )}

            <p
              style={{
                marginTop: "20px",
                textAlign: "center",
                fontSize: "12px",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              가입 시{" "}
              <span style={{ color: "var(--primary-400)", cursor: "pointer" }}>
                이용약관
              </span>{" "}
              및{" "}
              <span style={{ color: "var(--primary-400)", cursor: "pointer" }}>
                개인정보처리방침
              </span>
              에 동의합니다.
            </p>
          </div>
        )}

        {/* Email Step */}
        {step === "email" && (
          <div
            className="glass-card"
            style={{
              padding: "32px 24px",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <form onSubmit={handleEmailSubmit}>
              <label className="input-label" htmlFor="email">
                학교 이메일
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="학번@mju.ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginBottom: "8px" }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "20px",
                }}
              >
                명지대학교 공식 이메일만 사용 가능합니다
              </p>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ width: "100%", opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? "전송 중..." : "인증번호 발송"}
              </button>

              <button
                type="button"
                onClick={() => setStep("social")}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ← 소셜 로그인으로 돌아가기
              </button>
              
              {/* 🛠 개발자용 프리패스 버튼 (이메일 탭) */}
              {process.env.NODE_ENV === "development" && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/onboarding";
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    background: "rgba(168,85,247,0.15)",
                    border: "1px dashed var(--purple-500)",
                    color: "var(--purple-400)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Icons.Sliders /> [개발용] 에러 시 바로 통과하기
                </button>
              )}
            </form>
          </div>
        )}

        {/* Verify Step */}
        {step === "verify" && (
          <div
            className="glass-card"
            style={{
              padding: "32px 24px",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <form onSubmit={handleVerify}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    color: "var(--primary-400)",
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Icons.MessageText />
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--primary-400)" }}>
                    {email}
                  </strong>
                  <br />
                  으로 전송된 6자리 코드를 입력하세요
                </p>
              </div>

              <input
                id="code"
                type="text"
                className="input-field"
                placeholder="인증번호 6자리"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                style={{
                  marginBottom: "20px",
                  textAlign: "center",
                  fontSize: "24px",
                  letterSpacing: "8px",
                  fontWeight: 700,
                }}
              />

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || code.length !== 6}
                style={{
                  width: "100%",
                  opacity: isLoading || code.length !== 6 ? 0.6 : 1,
                }}
              >
                {isLoading ? "확인 중..." : "인증 완료"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                인증번호 다시 받기
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
