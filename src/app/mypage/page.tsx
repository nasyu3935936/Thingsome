"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ========== 고급스러운 SVG 아이콘 모음 ==========
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Chat: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Sparkles: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>,
  Sliders: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="21" y2="21" /><line x1="4" x2="20" y1="14" y2="14" /><line x1="4" x2="20" y1="7" y2="7" /><polyline points="14 10 14 14 10 14" /><polyline points="10 17 10 21 6 21" /><polyline points="18 3 18 7 14 7" /></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>,
  Help: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>,
  Heart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
  Link: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
};

function BottomNav({ active }: { active: string }) {
  const router = useRouter();
  const supabase = createClient();
  const items = [
    { id: "home", label: "홈", icon: <Icons.Home />, href: "/home" },
    { id: "chat", label: "채팅", icon: <Icons.Chat />, href: "/chat" },
    { id: "ssum", label: "썸 측정", icon: <Icons.Sparkles />, href: "/ssum" },
    { id: "my", label: "마이", icon: <Icons.User />, href: "/mypage" },
  ];

  const handleChatClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .limit(1);

      if (error) throw error;
      if (rooms && (rooms as any).length > 0) {
        router.push('/chat');
      } else {
        alert('매칭 중인 방이 없습니다!');
        router.push('/home');
      }
    } catch (e) {
      console.error('chat nav error', e);
      alert('채팅을 불러오지 못했습니다.');
      router.push('/home');
    }
  };

  return (
    <nav className="nav-bottom">
      <div className="nav-bottom-inner">
        {items.map((item) => (
          item.id === 'chat' ? (
            <button key={item.id} onClick={handleChatClick} type="button" className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}>
              <span style={{ marginBottom: "4px" }}>{item.icon}</span>
              <span style={{ fontSize: "10px" }}>{item.label}</span>
            </button>
          ) : (
            <Link key={item.id} href={item.href} className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}>
              <span style={{ marginBottom: "4px" }}>{item.icon}</span>
              <span style={{ fontSize: "10px" }}>{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
}

export default function MyPage() {
  // 프로필 상태 (온보딩에서 사용한 필드와 동일하게 유지)
  const [profile, setProfile] = useState<any>({
    nickname: "캠퍼스탐험가",
    department: "ICT융합대학",
    year: 2023,
    age: 24,
    gender: "남성",
    bio: "명지대 캠퍼스를 사랑하는 개발자",
    interests: ["코딩", "카페", "운동", "음악", "영화"],
    prefDepartments: [] as string[],
    prefExcludeSameDept: false,
    prefAgeMin: 20,
    prefAgeMax: 28,
    schoolEmailVerified: false,
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // 프로필 수정 폼 상태
  const INTEREST_OPTIONS = [
    "운동", "영화", "음악", "독서", "게임", "여행", "맛집",
    "카페", "패션", "사진", "요리", "반려동물", "K-POP",
    "넷플릭스", "캠핑", "헬스", "러닝", "등산", "드로잉",
    "코딩", "자기계발", "봉사활동",
  ];

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

  const [editForm, setEditForm] = useState<any>({ nickname: "", bio: "", department: "", major: "", year: "", age: "", gender: "", interests: [] as string[], prefDepartments: [] as string[], prefExcludeSameDept: false, prefAgeMin: 20, prefAgeMax: 28 });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // 로그인 사용자가 있다면 DB에서 프로필을 불러옵니다. 없으면 로컬 저장소를 사용.
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbProfile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (!error && dbProfile) {
            // 사용자의 로컬 설정(같은 학과 제외)이 있으면 우선 사용
            const localExclude = (() => { try { return localStorage.getItem('thingsome_pref_exclude_same_dept') === 'true'; } catch (e) { return false; } })();
            setProfile({
              nickname: dbProfile.nickname || '익명',
              department: dbProfile.major || DEPARTMENTS[0],
              year: dbProfile.student_id || 2024,
              age: dbProfile.age || 20,
              gender: dbProfile.gender || '',
              bio: dbProfile.bio || '',
              interests: dbProfile.tags || [],
              prefDepartments: dbProfile.pref_departments || [],
              prefExcludeSameDept: localExclude,
              prefAgeMin: dbProfile.preferred_age_min || 20,
              prefAgeMax: dbProfile.preferred_age_max || 28,
              schoolEmailVerified: dbProfile.school_email_verified || false,
            });
            return;
          }
        }

        // DB에 프로필이 없으면 로컬 임시 프로필 불러오기
        const saved = localStorage.getItem('thingsome_temp_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const parsedExclude = parsed.prefExcludeSameDept === true || parsed.prefExcludeSameDept === 'true';
            const localExclude = (() => { try { return localStorage.getItem('thingsome_pref_exclude_same_dept') === 'true'; } catch (e) { return false; } })();
            setProfile({
              nickname: parsed.nickname || '캠퍼스탐험가',
              department: parsed.department || DEPARTMENTS[0],
              year: parsed.admissionYear || 2023,
              age: parsed.age || 20,
              gender: parsed.gender || '여성',
              bio: parsed.bio || '방금 온보딩에서 작성하신 소개글입니다',
              interests: parsed.interests && parsed.interests.length > 0 ? parsed.interests : ['선택없음'],
              prefDepartments: parsed.prefDepartments || [],
              prefExcludeSameDept: parsed.prefExcludeSameDept || localExclude,
              prefAgeMin: parsed.prefAgeMin || 20,
              prefAgeMax: parsed.prefAgeMax || 28,
            });
          } catch (e) {
            console.error('Failed to parse temp profile');
          }
        }
      } catch (err) {
        console.error('profile load failed', err);
      }
    })();
  }, []);

  const handleOpenEdit = () => {
    setEditForm({
      nickname: profile.nickname,
      bio: profile.bio,
      department: profile.department,
      major: profile.department,
      year: profile.year,
      age: profile.age,
      gender: profile.gender,
      interests: profile.interests || [],
      prefDepartments: profile.prefDepartments || [],
      prefExcludeSameDept: profile.prefExcludeSameDept || false,
      prefAgeMin: profile.prefAgeMin || 20,
      prefAgeMax: profile.prefAgeMax || 28,
    });
    setActiveModal("edit");
  };
  // 프로필 저장: DB에 upsert 후 상태와 로컬 저장소 업데이트
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // 준비할 페이로드
      // DB 스키마에 없는 컬럼(pref_departments 등)을 포함하면 upsert 실패할 수 있으므로
      // 존재가 확실한 컬럼들만 포함하여 페이로드를 구성합니다.
      const payload: any = {
        nickname: editForm.nickname,
        major: editForm.major || editForm.department,
        student_id: String(editForm.year),
        gender: editForm.gender,
        age: Number(editForm.age),
        bio: editForm.bio,
        tags: editForm.interests,
        preferred_age_min: Number(editForm.prefAgeMin),
        preferred_age_max: Number(editForm.prefAgeMax),
        school_email_verified: profile.schoolEmailVerified || false,
      };

      if (user) {
        // upsert (id 포함)
        const upsertPayload = { id: user.id, ...payload };
        const { error } = await supabase.from('profiles').upsert(upsertPayload);
        if (error) throw error;
      } else {
        // 비로그인 시 로컬에 저장
        const saved = localStorage.getItem('thingsome_temp_profile');
        const parsed = saved ? JSON.parse(saved) : {};
        const merged = { ...parsed, ...payload };
        localStorage.setItem('thingsome_temp_profile', JSON.stringify(merged));
      }

      // 매칭 선호(같은 학과 제외) 설정은 DB 스키마에 필드가 없을 수 있어 로컬스토리지에 별도 저장
      try {
        localStorage.setItem('thingsome_pref_exclude_same_dept', String(!!editForm.prefExcludeSameDept));
        // also merge into temp profile for dev flows
        const temp = localStorage.getItem('thingsome_temp_profile');
        const parsedTemp = temp ? JSON.parse(temp) : {};
        parsedTemp.prefExcludeSameDept = !!editForm.prefExcludeSameDept;
        localStorage.setItem('thingsome_temp_profile', JSON.stringify(parsedTemp));
      } catch (e) {
        // ignore
      }

      // 상태 반영: UI에선 기존 `department` 필드에 전공(major)을 보여주도록 반영
      setProfile((prev: any) => ({ ...prev, department: payload.major || prev.department, ...payload }));
      alert('프로필이 저장되었습니다.');
      setActiveModal(null);
    } catch (err: any) {
      alert(`프로필 저장 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("정말로 로그아웃 하시겠습니까?")) {
      await supabase.auth.signOut();
      localStorage.removeItem("thingsome_temp_profile");
      window.location.href = "/login";
    }
  };

  const menuItems = [
    { id: "edit", icon: <Icons.Edit />, label: "프로필 수정", desc: "닉네임, 소개 변경" },
    { id: "prefs", icon: <Icons.Sliders />, label: "매칭 선호도", desc: "선호 학과, 연령대 설정" },
    { id: "notifs", icon: <Icons.Bell />, label: "알림 설정", desc: "매칭, 채팅 알림 관리" },
    { id: "block", icon: <Icons.Shield />, label: "차단 목록", desc: "차단한 사용자 관리" },
    { id: "history", icon: <Icons.Chart />, label: "분석 기록", desc: "과거 썸 측정 결과 보기" },
    { id: "support", icon: <Icons.Help />, label: "고객센터", desc: "문의 및 도움말" },
  ];

  return (
    <main className="pb-safe">
      <div className="container-app" style={{ paddingTop: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "28px" }}>마이페이지</h1>

        {/* Profile Card */}
        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--gradient-primary)", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-glow)", flexShrink: 0,
              color: "white", fontSize: "28px", fontWeight: "bold"
            }}>
              {profile.nickname.charAt(0)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700 }}>{profile.nickname}</span>
                <span className="badge badge-verified"><span>✓</span> 인증</span>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                {profile.department} · {profile.year}학번 · {profile.age}세
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                &ldquo;{profile.bio}&rdquo;
              </div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                {profile.interests.map((tag: string) => (
                  <span key={tag} className="tag" style={{ fontSize: "11px", padding: "3px 8px" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "총 매칭", value: "12", icon: <Icons.Link /> },
            { label: "썸 측정", value: "8", icon: <Icons.Sparkles /> },
            { label: "호감 받은", value: "5", icon: <Icons.Heart /> },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", color: "var(--primary-400)", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "22px", fontWeight: 800, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {menuItems.map((item) => (
            <button key={item.id} className="glass-card" onClick={() => item.id === "edit" ? handleOpenEdit() : setActiveModal(item.id)} style={{
              padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer",
              border: "1px solid var(--border-subtle)", background: "var(--bg-glass)", width: "100%",
              textAlign: "left", fontFamily: "inherit", color: "var(--text-primary)"
            }}>
              <span style={{ color: "var(--primary-300)" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.desc}</div>
              </div>
              <span style={{ color: "var(--text-muted)" }}>→</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          width: "100%", padding: "14px", marginTop: "24px",
          background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)", color: "var(--error)",
          fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>로그아웃</button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px", paddingBottom: "20px" }}>
          띵썸 v1.0.0
        </p>
      </div>

      <BottomNav active="my" />

      {/* ========== Modals ========== */}

      {/* 1. 프로필 수정 모달 */}
      {activeModal === "edit" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 11, 26, 0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ width: "100%", maxWidth: 820, height: "calc(100vh - 48px)", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ background: "rgba(15, 11, 26, 0.98)", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>프로필 수정</h2>
              </div>

              <div style={{ padding: 16, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", flex: 1, minHeight: 0 }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>닉네임</label>
                    <input className="input-field" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>학과</label>
                      <select className="input-field" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value, major: "" })}>
                        <option value="">선택하세요</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>

                      {/* 전공(세부) 선택: 선택한 학과에 매핑된 전공이 있으면 표시 */}
                      {(MAJORS[editForm.department] || []).length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>전공(세부)</label>
                          <select className="input-field" value={editForm.major} onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}>
                            <option value="">세부 전공 선택 (선택사항)</option>
                            {(MAJORS[editForm.department] || []).map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <div style={{ width: 120, minWidth: 100 }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>학번</label>
                      <input className="input-field" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
                    </div>
                    <div style={{ width: 100, minWidth: 80 }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>나이</label>
                      <input className="input-field" type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>성별</label>
                      <select className="input-field" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                        <option value="">선택</option>
                        <option value="여성">여성</option>
                        <option value="남성">남성</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>선호 연령대 (최소)</label>
                      <input className="input-field" type="number" value={editForm.prefAgeMin} onChange={(e) => setEditForm({ ...editForm, prefAgeMin: Number(e.target.value) })} />
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>선호 연령대 (최대)</label>
                      <input className="input-field" type="number" value={editForm.prefAgeMax} onChange={(e) => setEditForm({ ...editForm, prefAgeMax: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>내 소개</label>
                    <textarea className="input-field" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>관심사 (최대 5개 선택)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {INTEREST_OPTIONS.map((tag: string) => {
                        const active = (editForm.interests || []).includes(tag);
                        return (
                          <button key={tag} type="button" onClick={() => {
                            const curr = editForm.interests || [];
                            if (curr.includes(tag)) setEditForm({ ...editForm, interests: curr.filter((t: string) => t !== tag) });
                            else if (curr.length < 5) setEditForm({ ...editForm, interests: [...curr, tag] });
                          }} className="tag" style={{ opacity: active ? 1 : 0.7 }}>{tag}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>선호 학과</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {DEPARTMENTS.map((d: string) => {
                        const active = (editForm.prefDepartments || []).includes(d);
                        return (
                          <button key={d} type="button" onClick={() => {
                            const curr = editForm.prefDepartments || [];
                            if (curr.includes(d)) setEditForm({ ...editForm, prefDepartments: curr.filter((p: string) => p !== d) });
                            else setEditForm({ ...editForm, prefDepartments: [...curr, d] });
                          }} className="tag" style={{ opacity: active ? 1 : 0.7 }}>{d}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.03)", display: 'flex', gap: 12 }}>
                <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ flex: 1 }}>취소</button>
                <button className="btn-primary" onClick={handleSaveProfile} style={{ flex: 2 }} disabled={saving}>{saving ? '저장 중...' : '저장하기'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 매칭 선호도 모달 */}
      {activeModal === "prefs" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 11, 26, 0.95)", zIndex: 100, display: "flex", flexDirection: "column", padding: "24px", animation: "fadeIn 0.2s ease-out" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>매칭 선호도 설정</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>어떤 상대와의 매칭을 선호하시나요?</p>

          <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontWeight: 600 }}>선호 연령대</span>
              <span style={{ color: "var(--primary-400)" }}>20세 - 26세</span>
            </div>
            <input type="range" min="19" max="30" defaultValue="26" style={{ width: "100%", accentColor: "var(--primary-500)" }} />
          </div>

          <div className="glass-card" style={{ padding: "20px", marginBottom: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>같은 학과 제외하기</span>
              <input
                type="checkbox"
                checked={!!editForm.prefExcludeSameDept}
                onChange={(e) => setEditForm({ ...editForm, prefExcludeSameDept: e.target.checked })}
                style={{ width: "20px", height: "20px", accentColor: "var(--primary-500)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ flex: 1 }}>취소</button>
            <button className="btn-primary" onClick={() => {
                // 저장: 로컬스토리지 및 프로필 상태 반영
                try {
                  localStorage.setItem('thingsome_pref_exclude_same_dept', String(!!editForm.prefExcludeSameDept));
                } catch (e) {}
                setProfile((p: any) => ({ ...p, prefExcludeSameDept: !!editForm.prefExcludeSameDept }));
                setActiveModal(null);
              }} style={{ flex: 2 }}>적용하기</button>
          </div>
        </div>
      )}

      {/* 3. 기타 더미 모달 (알림, 차단, 기록, 고객센터) */}
      {["notifs", "block", "history", "support"].includes(activeModal || "") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 11, 26, 0.95)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>🚧</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>준비 중인 기능입니다</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "center", marginBottom: "32px" }}>
            더 나은 띵썸을 위해 열심히 개발하고 있어요.<br />조금만 기다려주세요!
          </p>
          <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ width: "100%", maxWidth: "200px" }}>확인</button>
        </div>
      )}
    </main>
  );
}
