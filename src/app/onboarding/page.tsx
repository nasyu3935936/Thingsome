"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Icons } from "@/components/Icons";

const DEPARTMENTS = [
  "인문대학",
  "사회과학대학",
  "경영대학",
  "법과대학",
  "미디어·휴먼라이프대학",
  "인공지능·소프트웨어융합대학",
  "미래융합대학",
  "화학·생명과학대학",
  "스마트시스템공과대학",
  "반도체·ICT대학",
  "스포츠·예술대학",
  "건축대학",
  "아너칼리지",
  "방목기초교육대학",
];

const MAJORS: Record<string, string[]> = {
  "인문대학": ["인문콘텐츠학부", "국어국문학전공", "영어영문학전공", "미술사·역사학전공", "문헌정보학전공", "문예창작학과", "철학과", "아랍지역학전공", "글로벌한국어학전공"],
  "사회과학대학": ["공공인재학부(행정학전공)", "정치외교학전공", "경상·통계학부(경제학전공)", "국제통상학전공", "응용통계학전공", "법학과"],
  "경영대학": ["경영학부(경영학전공)", "글로벌비즈니스학전공", "경영정보학과"],
  "법과대학": ["법학과"],
  "미디어·휴먼라이프대학": ["디지털미디어학부", "청소년지도·아동학부", "유아교육과", "심리치료학과", "사회복지서비스학과", "보건정보관리학과"],
  "인공지능·소프트웨어융합대학": ["융합소프트웨어학부(응용소프트웨어전공)", "데이터사이언스전공", "인공지능전공", "디지털콘텐츠디자인학과"],
  "미래융합대학": ["창의융합인재학부", "사회복지학과", "부동산학과", "법무행정학과", "심리치료학과", "미래융합경영학과", "회계세무학과", "멀티디자인학과"],
  "화학·생명과학대학": ["화학·에너지융합학부(화학나노학전공)", "융합에너지학전공", "융합바이오학부(식품영양학전공)", "시스템생명과학전공", "수학과", "물리학과"],
  "스마트시스템공과대학": ["기계시스템공학부(기계공학전공)", "로봇공학전공", "스마트인프라공학부(건설환경공학전공)", "환경시스템공학전공", "스마트모빌리티공학전공", "화학신소재공학부"],
  "반도체·ICT대학": ["반도체공학부", "전기공학전공", "전자공학전공", "컴퓨터공학전공", "정보통신공학전공", "산업경영공학과"],
  "스포츠·예술대학": ["디자인학부(비주얼커뮤니케이션디자인)", "인더스트리얼디자인전공", "영상애니메이션디자인전공", "패션디자인전공", "공연예술학부(연극·영화전공)", "뮤지컬공연전공", "스포츠학부", "아트앤멀티미디어음악학부"],
  "건축대학": ["건축학부(건축학전공)", "전통건축전공", "공간디자인학과"],
  "아너칼리지": ["자율전공학부(인문)", "자율전공학부(자연)"],
  "방목기초교육대학": ["방목기초교육대학(인문)", "방목기초교육대학(자연)"],
};

const INTEREST_OPTIONS = [
  "운동", "영화", "음악", "독서", "게임", "여행", "맛집",
  "카페", "패션", "사진", "요리", "반려동물", "K-POP",
  "넷플릭스", "캠핑", "헬스", "러닝", "등산", "드로잉",
  "코딩", "자기계발", "봉사활동",
];

export default function OnboardingPage() {
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    nickname: "",
    department: "",
    major: "",
    admissionYear: "",
    gender: "",
    age: "",
    bio: "",
    interests: [] as string[],
    prefDepartments: [] as string[],
    prefAgeMin: 20,
    prefAgeMax: 28,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/profile/status");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (data.schoolEmailVerified) {
          window.location.href = "/home";
          return;
        }
        if (data.hasProfile && !data.schoolEmailVerified) {
          window.location.href = "/verify-school-email";
          return;
        }
      } catch {
        // 상태 확인 실패 시 온보딩 진행 허용
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, []);

  const toggleInterest = (tag: string) => {
    setProfile((prev) => {
      if (prev.interests.includes(tag)) {
        return { ...prev, interests: prev.interests.filter((t) => t !== tag) };
      }
      if (prev.interests.length >= 5) return prev;
      return { ...prev, interests: [...prev.interests, tag] };
    });
  };

  const togglePrefDept = (dept: string) => {
    setProfile((prev) => {
      if (prev.prefDepartments.includes(dept)) {
        return {
          ...prev,
          prefDepartments: prev.prefDepartments.filter((d) => d !== dept),
        };
      }
      return { ...prev, prefDepartments: [...prev.prefDepartments, dept] };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.nickname && profile.department && profile.admissionYear && profile.gender && profile.age;
      case 2:
        return profile.bio && profile.interests.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (process.env.NODE_ENV === "development") {
          alert("[개발 모드] 로그인 정보가 없어 DB 대신 브라우저 임시 저장소에 저장하고 홈으로 이동합니다.");
          // 로컬 스토리지에 프로필 임시 저장 (개발용)
          localStorage.setItem("thingsome_temp_profile", JSON.stringify(profile));
          window.location.href = "/home";
          return;
        }
        throw new Error("로그인 세션이 없습니다.");
      }

      const res = await fetch("/api/profile/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: profile.nickname,
          major: profile.major || profile.department,
          student_id: profile.admissionYear,
          gender: profile.gender,
          age: parseInt(profile.age, 10),
          bio: profile.bio,
          tags: profile.interests,
          preferred_age_min: profile.prefAgeMin,
          preferred_age_max: profile.prefAgeMax,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "프로필 저장 실패");

      window.location.href = json.redirect || "/verify-school-email";
      
    } catch (error: any) {
      alert(`프로필 저장 실패: ${error.message}`);
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
        padding: "40px 20px 120px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 800 }}>
          <span
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            프로필 설정
          </span>
        </h1>
        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          {step}/3
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: "4px",
          background: "var(--bg-glass)",
          borderRadius: "2px",
          marginBottom: "32px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / 3) * 100}%`,
            background: "var(--gradient-primary)",
            borderRadius: "2px",
            transition: "width var(--transition-slow)",
          }}
        />
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            기본 정보
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "28px",
            }}
          >
            캠퍼스에서 나를 찾을 수 있도록 기본 정보를 입력해주세요
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Profile Photo */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "var(--gradient-card)",
                  border: "2px dashed var(--border-medium)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  cursor: "pointer",
                  color: "var(--primary-400)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icons.Camera />
              </div>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                프로필 사진 (필수)
              </span>
            </div>

            {/* Nickname */}
            <div>
              <label className="input-label">닉네임</label>
              <input
                className="input-field"
                placeholder="2~10자 닉네임"
                value={profile.nickname}
                onChange={(e) =>
                  setProfile({ ...profile, nickname: e.target.value.slice(0, 10) })
                }
              />
            </div>

            {/* Department */}
            <div>
              <label className="input-label">학과 계열</label>
              <select
                className="input-field"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value, major: "" })}
                style={{ cursor: "pointer" }}
              >
                <option value="">학과 계열 선택</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {profile.department && (
              <div>
                <label className="input-label">학과 / 전공</label>
                <select
                  className="input-field"
                  value={profile.major}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">학과/전공 선택 (선택사항)</option>
                  {(MAJORS[profile.department] || []).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Admission Year */}
            <div>
              <label className="input-label">학번 연도</label>
              <select
                className="input-field"
                value={profile.admissionYear}
                onChange={(e) =>
                  setProfile({ ...profile, admissionYear: e.target.value })
                }
                style={{ cursor: "pointer" }}
              >
                <option value="">입학 연도 선택</option>
                {Array.from({ length: 8 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}학번
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="input-label">성별</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {["남성", "여성"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: g })}
                    className={profile.gender === g ? "tag tag-active" : "tag"}
                    style={{ flex: 1, justifyContent: "center", padding: "12px", display: "flex", gap: "6px" }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="input-label">나이</label>
              <input
                className="input-field"
                type="number"
                placeholder="만 나이"
                min={18}
                max={35}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: About Me */}
      {step === 2 && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            자기소개
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "28px",
            }}
          >
            상대방에게 나를 보여줄 수 있는 소개를 작성해주세요
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Bio */}
            <div>
              <label className="input-label">한 줄 소개</label>
              <textarea
                className="input-field"
                placeholder="나를 한 줄로 소개해주세요"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value.slice(0, 50) })}
                maxLength={50}
                rows={2}
                style={{ resize: "none" }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  float: "right",
                  marginTop: "4px",
                }}
              >
                {profile.bio.length}/50
              </span>
            </div>

            {/* Interests */}
            <div>
              <label className="input-label">
                관심사 태그 ({profile.interests.length}/5)
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {INTEREST_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={
                      profile.interests.includes(tag) ? "tag tag-active" : "tag"
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            매칭 선호도
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "28px",
            }}
          >
            원하는 상대방의 조건을 설정해주세요
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Preferred Departments */}
            <div>
              <label className="input-label">선호 학과 계열 (복수 선택 가능)</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => togglePrefDept(dept)}
                    className={
                      profile.prefDepartments.includes(dept)
                        ? "tag tag-active"
                        : "tag"
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className="input-label">
                선호 연령대: {profile.prefAgeMin}세 ~ {profile.prefAgeMax}세
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "8px" }}>
                <input
                  type="range"
                  min={18}
                  max={35}
                  value={profile.prefAgeMin}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      prefAgeMin: Math.min(Number(e.target.value), profile.prefAgeMax),
                    })
                  }
                  style={{ flex: 1, accentColor: "var(--primary-500)" }}
                />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>~</span>
                <input
                  type="range"
                  min={18}
                  max={35}
                  value={profile.prefAgeMax}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      prefAgeMax: Math.max(Number(e.target.value), profile.prefAgeMin),
                    })
                  }
                  style={{ flex: 1, accentColor: "var(--primary-500)" }}
                />
              </div>
            </div>

            {/* Preview Card */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icons.Clipboard /> 프로필 미리보기
              </h3>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    flexShrink: 0,
                    color: "white",
                  }}
                >
                  <Icons.User />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "2px" }}>
                    {profile.nickname || "닉네임"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {profile.department || "학과"} · {profile.admissionYear || "20XX"}학번 · {profile.age || "?"}세
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    {profile.bio || "한 줄 소개를 입력하세요"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      flexWrap: "wrap",
                      marginTop: "8px",
                    }}
                  >
                    {profile.interests.map((tag) => (
                      <span key={tag} className="tag" style={{ fontSize: "11px", padding: "3px 8px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(15, 11, 26, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "16px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {step > 1 && (
            <button
              className="btn-secondary"
              onClick={() => setStep(step - 1)}
              style={{ flex: 1 }}
            >
              이전
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => (step < 3 ? setStep(step + 1) : handleComplete())}
            disabled={!canProceed()}
            style={{
              flex: step > 1 ? 2 : 1,
              opacity: canProceed() ? 1 : 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            {step < 3 ? "다음" : <><Icons.Sparkles /> 시작하기</>}
          </button>
        </div>
      </div>
    </main>
  );
}
