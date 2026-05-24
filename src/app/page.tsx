"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";

/* ========== Floating Hearts Background ========== */
function FloatingHearts() {
  const hearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    size: 12 + Math.random() * 20,
    opacity: 0.05 + Math.random() * 0.1,
  }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: "absolute",
            left: `${h.left}%`,
            bottom: "-40px",
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animation: `floatUp ${h.duration}s ${h.delay}s ease-in infinite`,
          }}
        >
          <div style={{ color: "var(--primary-300)" }}>
            <Icons.HeartFilled />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ========== Hero Section ========== */
function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      {/* Glow Orbs */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)",
          top: "10%",
          left: "-10%",
          filter: "blur(60px)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          bottom: "15%",
          right: "-5%",
          filter: "blur(60px)",
          animation: "float 7s ease-in-out infinite reverse",
        }}
      />

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
          maxWidth: "500px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "64px",
            marginBottom: "8px",
            animation: "heartbeat 2s ease-in-out infinite",
          }}
        >
          <div style={{ color: "var(--primary-400)", width: "64px", height: "64px", margin: "0 auto" }}>
            <Icons.HeartFilled />
          </div>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 8vw, 52px)",
            fontWeight: 800,
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.2,
            marginBottom: "8px",
            letterSpacing: "-1px",
          }}
        >
          띵썸
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "var(--primary-300)",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          DdingSum
        </p>

        <p
          style={{
            fontSize: "clamp(16px, 4vw, 20px)",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          명지대 재학생만을 위한
          <br />
          <span
            style={{
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            AI 캠퍼스 소개팅
          </span>
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Link href="/login" className="btn-primary" style={{ width: "100%", maxWidth: "320px", display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ display: "flex" }}><Icons.Send /></span>
            시작하기
          </Link>
          <Link href="/ssum" className="btn-secondary" style={{ width: "100%", maxWidth: "320px", display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ display: "flex" }}><Icons.Sparkles /></span>
            썸 측정기 체험하기
          </Link>
        </div>

        {/* Trust Badge */}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div className="badge badge-verified" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span><Icons.Check /></span> 명지대 인증
          </div>
          <div className="badge badge-new" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span><Icons.Shield /></span> 안전한 매칭
          </div>
          <div className="badge badge-verified" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span><Icons.Target /></span> AI 분석
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== Feature Cards ========== */
function FeatureSection() {
  const features = [
    {
      icon: <Icons.GraduationCap />,
      title: "재학생 인증",
      desc: "명지대 학교 이메일(@mju.ac.kr) 인증으로 안전한 커뮤니티를 보장합니다.",
      gradient: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.1) 100%)",
      color: "var(--primary-400)",
    },
    {
      icon: <Icons.Heart />,
      title: "랜덤 매칭",
      desc: "취향과 관심사를 반영한 AI 기반 이성 매칭으로 설레는 만남을 시작하세요.",
      gradient: "linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(244,63,94,0.1) 100%)",
      color: "var(--accent-400)",
    },
    {
      icon: <Icons.Chat />,
      title: "24시간 채팅",
      desc: "매칭 성사 후 24시간 동안 대화하며 서로를 알아가세요. 호감이면 연장!",
      gradient: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(192,132,252,0.1) 100%)",
      color: "var(--purple-400)",
    },
    {
      icon: <Icons.Sparkles />,
      title: "AI 썸 측정기",
      desc: "대화 패턴을 AI가 분석해 두 사람의 썸 지수를 알려드립니다.",
      gradient: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.1) 100%)",
      color: "var(--success)",
    },
  ];

  return (
    <section
      style={{
        padding: "60px 20px 80px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        왜{" "}
        <span
          style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          띵썸
        </span>
        인가요?
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "var(--text-muted)",
          marginBottom: "40px",
          fontSize: "15px",
        }}
      >
        캠퍼스 소개팅의 새로운 기준
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {features.map((f, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: "24px",
              background: f.gradient,
              opacity: 0,
              animation: `fadeInUp 0.6s ease-out ${i * 0.15}s forwards`,
            }}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div
                style={{
                  fontSize: "32px",
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "var(--radius-md)",
                  flexShrink: 0,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== How It Works ========== */
function HowItWorks() {
  const steps = [
    { num: "01", title: "가입 & 인증", desc: "소셜 로그인 후 학교 이메일로 재학생 인증", icon: <Icons.User /> },
    { num: "02", title: "프로필 작성", desc: "나를 소개하고 매칭 선호도 설정", icon: <Icons.Edit /> },
    { num: "03", title: "랜덤 매칭", desc: "AI가 찾아주는 당신의 캠퍼스 인연", icon: <Icons.Compass /> },
    { num: "04", title: "대화 & 썸 측정", desc: "채팅하며 AI 썸 지수 확인하기", icon: <Icons.HeartFilled /> },
  ];

  return (
    <section
      style={{
        padding: "60px 20px 80px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        어떻게{" "}
        <span
          style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          시작
        </span>
        하나요?
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
              position: "relative",
              paddingBottom: i < steps.length - 1 ? "40px" : "0",
            }}
          >
            {/* Vertical Line */}
            {i < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: "27px",
                  top: "56px",
                  width: "2px",
                  height: "calc(100% - 56px)",
                  background: "linear-gradient(to bottom, var(--primary-500), transparent)",
                  opacity: 0.3,
                }}
              />
            )}

            {/* Number Circle */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: "var(--shadow-glow)",
                color: "white",
              }}
            >
              {s.icon}
            </div>

            {/* Content */}
            <div style={{ paddingTop: "4px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--primary-400)",
                  letterSpacing: "2px",
                  marginBottom: "4px",
                }}
              >
                STEP {s.num}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                {s.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== CTA Section ========== */
function CTASection() {
  return (
    <section
      style={{
        padding: "60px 20px 100px",
        textAlign: "center",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: "48px 24px",
          background: "var(--gradient-card)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.15), transparent)",
            filter: "blur(20px)",
          }}
        />

        <div style={{ color: "var(--primary-300)", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <Icons.Sparkles />
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "12px",
            lineHeight: 1.3,
          }}
        >
          오늘 밤, 캠퍼스에서
          <br />
          설레는 만남이 시작됩니다
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "32px",
            fontSize: "15px",
          }}
        >
          명지대 재학생이라면 지금 바로 시작하세요
        </p>
        <Link
          href="/login"
          className="btn-primary"
          style={{ width: "100%", maxWidth: "280px" }}
        >
          무료로 시작하기 →
        </Link>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
        <p>© 2026 띵썸 DdingSum. All rights reserved.</p>
        <p style={{ marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          Made with <span style={{ color: "var(--primary-400)" }}><Icons.HeartFilled /></span> for 명지대학교
        </p>
      </div>
    </section>
  );
}

/* ========== Landing Page ========== */
export default function LandingPage() {
  return (
    <main>
      <FloatingHearts />
      <HeroSection />
      <FeatureSection />
      <HowItWorks />
      <CTASection />
    </main>
  );
}
