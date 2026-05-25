"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Icons } from "@/components/Icons";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const id = params?.id;
        if (!id) return router.push('/home');
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        setProfile(data || null);
      } catch (e) {
        console.error('profile fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>로딩 중...</div>;
  if (!profile) return <div style={{ padding: 24, textAlign: 'center' }}>프로필을 찾을 수 없습니다.</div>;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <Icons.ArrowLeft />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{profile.nickname}</h1>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 16, display: 'flex', gap: 16 }}>
        <div style={{ width: 96, height: 96, borderRadius: 18, background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{profile.nickname.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{profile.nickname}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{profile.major || profile.department || ''} · {profile.student_id || ''}학번 · {profile.age ? `${profile.age}세` : ''}</div>
          <div style={{ marginTop: 12 }}>{profile.bio || '소개글이 없습니다.'}</div>
        </div>
      </div>

      {profile.tags && profile.tags.length > 0 && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>관심사</h3>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={() => router.back()} style={{ flex: 1 }}>뒤로</button>
        <a className="btn-secondary" href={`mailto:${profile.email || ''}`} style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>연락</a>
      </div>
    </main>
  );
}
