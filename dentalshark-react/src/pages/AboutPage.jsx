import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { USERS, VALUES } from '../data';
import UserProfileModal from '../components/ui/UserProfileModal';

export default function AboutPage() {
  const { isAr } = useLanguage();
  const founders = USERS.filter(u => u.id !== 'guest');
  const [selectedFounder, setSelectedFounder] = useState(null);

  return (
    <div style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{ padding: '64px 48px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          {isAr ? 'من نحن' : 'ABOUT US'}
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: 'var(--text)', letterSpacing: 2, marginBottom: 20 }}>
          {isAr ? 'قصة ' : 'THE '}
          <span style={{ color: 'var(--teal)' }}>{isAr ? 'دنتال شارك' : 'DENTALSHARK'}</span>
          {!isAr && ' STORY'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 680, lineHeight: 1.85 }}>
          {isAr
            ? 'تأسست شركتنا على يد نخبة من مهندسي الأجهزة الطبية الذين كرسوا جهودهم لتوفير صيانة معتمدة لعيادات طب الأسنان في مصر. DentalShark تجسر الفجوة بين العلامات التجارية العالمية والعيادات المصرية. منذ عام ٢٠٢٢، خدمنا أكثر من ٥٠٠٠ طبيب أسنان في جميع المحافظات الـ٢٧.'
            : "Founded by engineers dedicated to transforming how dental professionals in Egypt access quality equipment and maintenance. DentalShark bridges the gap between global dental brands and Egyptian clinics, built on trust, precision, and passion for dental excellence. Since 2022, we've served over 5,000 dental professionals across all 27 governorates."}
        </p>
      </div>

      {/* Founders grid */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          {isAr ? 'المؤسسون' : 'THE FOUNDERS'}
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--text)', marginBottom: 28 }}>
          {isAr ? 'تعرف على ' : 'MEET OUR '}
          <span style={{ color: 'var(--teal)' }}>{isAr ? 'مؤسسينا' : 'FOUNDERS'}</span>
        </h2>
        <div className="team-grid">
          {founders.map(u => (
            <div key={u.id} className="team-card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }}
              onClick={() => setSelectedFounder(u)} role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') setSelectedFounder(u); }}>
              {/* Avatar with gradient */}
              <div style={{
                width: 72, height: 72, borderRadius: 18, margin: '0 auto 14px',
                background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#fff',
              }}>
                {u.initials}
              </div>
              <div className="team-name" style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{u.name}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>{u.role}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.dept}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          {isAr ? 'قيمنا' : 'VALUES'}
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--text)', marginBottom: 28 }}>
          {isAr ? 'قيمنا' : <>OUR <span style={{ color: 'var(--teal)' }}>VALUES</span></>}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
          {VALUES.map(v => (
            <div key={v.nm} className="val-card">
              <div style={{ fontSize: 36, marginBottom: 14 }}>{v.ic}</div>
              <div className="val-name" style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{v.nm}</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{v.ds}</p>
            </div>
          ))}
        </div>
      </section>

      <UserProfileModal
        user={selectedFounder}
        open={!!selectedFounder}
        onClose={() => setSelectedFounder(null)}
        showActions={false}
        isAr={isAr}
      />
    </div>
  );
}
