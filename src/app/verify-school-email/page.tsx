"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Icons } from "@/components/Icons";
import { parseJsonResponse } from "@/lib/api/parse-json-response";

export default function VerifySchoolEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/profile/status");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await parseJsonResponse<{
          schoolEmailVerified?: boolean;
          hasProfile?: boolean;
          profile?: { school_email?: string };
        }>(res);

        if (data.schoolEmailVerified) {
          window.location.href = "/home";
          return;
        }

        if (!data.hasProfile) {
          window.location.href = "/onboarding";
          return;
        }

        if (data.profile?.school_email) {
          setEmail(data.profile.school_email);
        } else {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user?.email?.endsWith("@mju.ac.kr")) {
            setEmail(user.email);
          }
        }
      } catch {
        alert("상태 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setChecking(false);
      }
    };

    init();
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@mju.ac.kr")) {
      alert("명지대학교 이메일(@mju.ac.kr)만 사용 가능합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/school-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await parseJsonResponse<{ error?: string; success?: boolean; message?: string }>(res);
      if (!res.ok) throw new Error(json.error || "인증번호 발송 실패");

      alert(json.message || "인증번호가 메일로 발송되었습니다. (스팸함도 확인해주세요)");
      setStep("verify");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/school-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await parseJsonResponse<{ error?: string; redirect?: string; success?: boolean }>(res);
      if (!res.ok) {
        if (json.redirect) {
          window.location.href = json.redirect;
          return;
        }
        throw new Error(json.error || "인증 실패");
      }

      alert("학교 이메일 인증이 완료되었습니다!");
      window.location.href = json.redirect || "/home";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        확인 중...
      </main>
    );
  }

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
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: "12px",
            color: "var(--primary-400)",
            background: "rgba(168,85,247,0.12)",
            padding: "6px 12px",
            borderRadius: "999px",
            marginBottom: "16px",
          }}
        >
          2단계 / 학교 이메일 인증
        </div>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              color: "var(--primary-400)",
              display: "flex",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <Icons.MessageText />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
            학교 이메일 인증
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {step === "email"
              ? "프로필 설정이 완료되었습니다. 명지대 재학생 확인을 위해 학교 이메일을 인증해주세요. (최초 1회)"
              : "메일로 받은 인증번호 6자리를 입력해주세요."}
          </p>
        </div>

        <div className="glass-card" style={{ padding: "32px 24px" }}>
          {step === "email" ? (
            <form onSubmit={handleSendOtp}>
              <label className="input-label" htmlFor="school-email">
                학교 이메일
              </label>
              <input
                id="school-email"
                type="email"
                className="input-field"
                placeholder="학번@mju.ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginBottom: "20px" }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ width: "100%", opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? "전송 중..." : "인증번호 발송"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirm}>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <strong style={{ color: "var(--primary-400)" }}>{email}</strong>
                <br />
                으로 전송된 인증번호
              </p>
              <input
                type="text"
                className="input-field"
                placeholder="인증번호 6자리"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                maxLength={8}
                required
                style={{
                  marginBottom: "20px",
                  textAlign: "center",
                  fontSize: "22px",
                  letterSpacing: "6px",
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || code.length < 6}
                style={{
                  width: "100%",
                  opacity: isLoading || code.length < 6 ? 0.6 : 1,
                }}
              >
                {isLoading ? "확인 중..." : "인증 완료하고 시작하기"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                이메일 다시 입력
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
