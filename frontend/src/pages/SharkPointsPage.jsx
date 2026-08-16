import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';

const EARN_WAYS = [
  { icon: '🛒', title: '1 pt per 10 EGP spent',      badge: '⚡ Standard',  titleAr: '١ نقطة لكل ١٠ جنيهات' },
  { icon: '🔧', title: '2× points on service bookings', badge: '⚡ 2× Bonus', titleAr: 'ضعف النقاط على الصيانة' },
  { icon: '⭐', title: '50 pts per verified review',   badge: '⚡ 50 pts',   titleAr: '٥٠ نقطة لكل تقييم موثق' },
  { icon: '👥', title: '200 pts per referred doctor',  badge: '⚡ 200 pts',  titleAr: '٢٠٠ نقطة لكل طبيب ترشحه' },
];

const TIERS = [
  { icon: '🥉', name: 'BRONZE',   nameAr: 'البرونزية',  range: '0 – 999 pts',         color: '#cd7f32', min: 0,    max: 999 },
  { icon: '🥈', name: 'SILVER',   nameAr: 'الفضية',     range: '1,000 – 4,999 pts',   color: '#9ca3af', min: 1000, max: 4999 },
  { icon: '💠', name: 'PLATINUM', nameAr: 'البلاتينية', range: '5,000+ pts',           color: 'var(--teal)', min: 5000, max: Infinity, top: true },
];

export default function SharkPointsPage() {
  const { isAr } = useLanguage();
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const pts = user?.sharkPts || 0;
  const tier = TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];

  return (
    <div style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero band */}
      <div style={{ background: 'linear-gradient(180deg,#0a0f1f,var(--bg))', borderBottom: '1px solid var(--b2)', padding: '80px 32px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 20, padding: '5px 16px', fontSize: 11, fontWeight: 700, color: 'var(--gold)', marginBottom: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
          ⚡ {isAr ? 'برنامج الولاء' : 'LOYALTY PROGRAM'}
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, letterSpacing: 4, lineHeight: 1, marginBottom: 16 }}>
          <span style={{ color: 'var(--text)' }}>{isAr ? 'نقاط' : 'SHARK'} </span>
          <span style={{ color: 'var(--gold)' }}>{isAr ? 'SHARK' : 'POINTS'}</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 520, margin: '0 auto' }}>
          {isAr
            ? 'اكتسب نقاطاً مع كل عملية شراء أو حجز صيانة. استبدل نقاطك بخصومات حصرية وامتيازات VIP.'
            : 'Earn points on every purchase and repair booking. Redeem for exclusive discounts, free shipping, and VIP benefits.'}
        </p>
      </div>

      <div className="sec sp-balance-grid">
        {/* Left: Balance card */}
        <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 18, padding: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, textAlign: 'center' }}>
            {isAr ? 'رصيدك الحالي' : 'YOUR BALANCE'}
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, color: 'var(--gold)', textAlign: 'center', letterSpacing: 2, lineHeight: 1, marginBottom: 4 }}>{pts}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', marginBottom: 20 }}>{isAr ? 'نقاط SHARK' : 'SHARK Points'}</div>

          {/* Tier progress */}
          <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{tier.icon}</span>
            <span><strong>{tier.name} Tier</strong> — {tier.max !== Infinity ? `${tier.max - pts} pts to reach ${TIERS[TIERS.indexOf(tier) + 1]?.name || 'Top'}` : 'Top tier!'}</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/shop')}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              Redeem Now
            </button>
            <button onClick={() => navigate('/shop')}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(245,158,11,.15)', color: 'var(--gold)', fontWeight: 800, fontSize: 13, border: '1px solid rgba(245,158,11,.3)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              Earn More
            </button>
          </div>
        </div>

        {/* Right: Earn ways */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            {isAr ? 'طرق الكسب' : 'HOW TO EARN'}
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--text)', marginBottom: 24 }}>
            {isAr ? 'كيف تكسب ' : 'EARN '}<span style={{ color: 'var(--teal)' }}>{isAr ? 'نقاط SHARK' : 'SHARK POINTS'}</span>
          </h2>
          <div className="sp-earn-grid">
            {EARN_WAYS.map(w => (
              <div key={w.badge} className="sp-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{w.icon}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                  {isAr ? w.titleAr : w.title}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                  {w.badge}
                </div>
              </div>
            ))}
          </div>

          {/* Tiers */}
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            {isAr ? 'درجات العضوية' : 'MEMBERSHIP TIERS'}
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'var(--text)', marginBottom: 20 }}>
            {isAr ? 'مستوى ' : 'YOUR '}<span style={{ color: 'var(--teal)' }}>{isAr ? 'عضويتك المميزة' : 'VIP STATUS'}</span>
          </h2>
          <div className="sp-tiers-grid">
            {TIERS.map(t => {
              const isCurrent = pts >= t.min && pts <= t.max;
              return (
                <div key={t.name} style={{
                  background: 'var(--card)', border: `1px solid ${isCurrent ? t.color : 'var(--b2)'}`,
                  borderRadius: 14, padding: '20px 16px', textAlign: 'center',
                  boxShadow: isCurrent ? `0 0 20px ${t.color}33` : 'none',
                  transform: isCurrent ? 'translateY(-3px)' : 'none', transition: '.2s',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: t.color, letterSpacing: 1.5, marginBottom: 4 }}>
                    {isAr ? t.nameAr : t.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>{t.range}</div>
                  {t.top && <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1 }}>{isAr ? 'أعلى مستوى' : 'TOP TIER'}</div>}
                  {isCurrent && (
                    <div style={{ marginTop: 8, fontSize: 10, fontWeight: 800, background: `${t.color}22`, color: t.color, borderRadius: 20, padding: '3px 10px', display: 'inline-block' }}>
                      YOUR TIER
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
