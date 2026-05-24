"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const items = [
    { id: "home", label: "홈", icon: <Icons.Home />, href: "/home" },
    { id: "chat", label: "채팅", icon: <Icons.Chat />, href: "/chat" },
    { id: "ssum", label: "썸 측정", icon: <Icons.Sparkles />, href: "/ssum" },
    { id: "my", label: "마이", icon: <Icons.User />, href: "/mypage" },
  ];
  return (
    <nav className="nav-bottom">
      <div className="nav-bottom-inner">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}>
            <span style={{ marginBottom: "4px" }}>{item.icon}</span>
            <span style={{ fontSize: "10px" }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function MyPage() {
  const [profile, setProfile] = useState({
    nickname: "캠퍼스탐험가",
    department: "ICT융합대학",
    year: 2023,
    age: 24,
    gender: "남성",
    bio: "명지대 캠퍼스를 사랑하는 개발자",
    interests: ["코딩", "카페", "운동", "음악", "영화"],
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // 프로필 수정 폼 상태
  const [editForm, setEditForm] = useState({ nickname: "", bio: "" });

  const supabase = createClient();

  useEffect(() => {
    // 저장된 프로필이 있다면 불러오기 (DB 연동 시 여기서 Supabase select 사용)
    const saved = localStorage.getItem("thingsome_temp_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({
          nickname: parsed.nickname || "캠퍼스탐험가",
          department: parsed.department || "ICT융합대학",
          year: parsed.admissionYear || 2023,
          age: parsed.age || 24,
          gender: parsed.gender || "남성",
          bio: parsed.bio || "방금 온보딩에서 작성하신 소개글입니다",
          interests: parsed.interests && parsed.interests.length > 0 ? parsed.interests : ["선택없음"],
        });
      } catch (e) {
        console.error("Failed to parse temp profile");
      }
    }
  }, []);

  const handleOpenEdit = () => {
    setEditForm({ nickname: profile.nickname, bio: profile.bio });
    setActiveModal("edit");
  };

  const handleSaveProfile = () => {
    // 1. 상태 업데이트
    const updated = { ...profile, nickname: editForm.nickname, bio: editForm.bio };
    setProfile(updated);

    // 2. 로컬스토리지 업데이트
    const saved = localStorage.getItem("thingsome_temp_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.nickname = editForm.nickname;
      parsed.bio = editForm.bio;
      localStorage.setItem("thingsome_temp_profile", JSON.stringify(parsed));
    }

    // 3. (추후 추가) Supabase DB 업데이트 로직
    // supabase.from('profiles').update({ nickname: editForm.nickname, bio: editForm.bio }).eq('id', currentUser.id);

    setActiveModal(null);
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
                {profile.interests.map((tag) => (
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 11, 26, 0.95)", zIndex: 100, display: "flex", flexDirection: "column", padding: "24px", animation: "fadeIn 0.2s ease-out" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>프로필 수정</h2>

          <label style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>닉네임</label>
          <input className="input-field" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} style={{ marginBottom: "20px" }} />

          <label style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>내 소개</label>
          <textarea className="input-field" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} style={{ resize: "none", marginBottom: "auto" }} />

          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ flex: 1 }}>취소</button>
            <button className="btn-primary" onClick={handleSaveProfile} style={{ flex: 2 }}>저장하기</button>
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
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", accentColor: "var(--primary-500)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ flex: 1 }}>취소</button>
            <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ flex: 2 }}>적용하기</button>
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
