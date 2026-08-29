import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import UserProfileModal from '../components/ui/UserProfileModal';

/* ─── Countdown Timer ─── */
function useCountdown(initSecs) {
  const [secs, setSecs] = useState(initSecs);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s > 0 ? s - 1 : initSecs), 1000);
    return () => clearInterval(id);
  }, [initSecs]);
  return {
    h: String(Math.floor(secs / 3600)).padStart(2, '0'),
    m: String(Math.floor((secs % 3600) / 60)).padStart(2, '0'),
    s: String(secs % 60).padStart(2, '0'),
  };
}

/* ─── Timer Segment (flash deals HRS/MIN/SEC boxes) ─── */
function TimerSeg({ val, label }) {
  return (
    <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '8px 14px', textAlign: 'center', minWidth: 54 }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#f87171', letterSpacing: 2, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(248,113,113,.7)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ─── Hero Slideshow ─── */
const SLIDE_PRODUCT_IDS = [8, 10, 7, 4, 18, 6];

function HeroSlideshow({ isAr }) {
  const { products } = useProducts();
  const [idx, setIdx] = useState(0);
  const ssRef = useRef(null);
  const timerRef = useRef(null);

  // Each slide is looked up live, by product id, from the same product data driving
  // the rest of the app — never a frozen static copy — so it always reflects the
  // current image/price/name for that product.
  const slides = useMemo(() => {
    return SLIDE_PRODUCT_IDS
      .map(id => products.find(p => p.id === id))
      .filter(Boolean)
      .map(p => ({ nm: p.name, br: p.brand, cat: p.cat, pr: p.price.toLocaleString() + ' EGP', img: p.img }));
  }, [products]);

  const goSlide = useCallback(n => {
    if (!slides.length) return;
    setIdx((n + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (!slides.length) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  // 3D parallax tilt on mouse move
  useEffect(() => {
    const el = ssRef.current;
    if (!el || el.dataset.interactive) return;
    el.dataset.interactive = 'true';
    const onMove = e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const mx = rect.width / 2;
      const my = rect.height / 2;
      const rx = (my - y) / 12;
      const ry = (x - mx) / 12;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.025)`;
    };
    const onLeave = () => { el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  }, []);

  const slide = slides[idx] || {};
  const BADGE_BG = { RESTORATIVE: '#6366f1', HANDPIECES: '#8b5cf6', PERIODONTICS: '#0891b2', STERILIZATION: '#059669', 'DENTAL UNITS': '#d97706', IMAGING: '#ef4444', ENDODONTICS: '#7c3aed', SURGICAL: '#dc2626' };

  return (
    <div
      id="hero-ss"
      ref={ssRef}
      className="hero-slideshow"
      style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', width: '100%', height: '100%', minHeight: 480, background: 'linear-gradient(135deg,#0a1628,#0f2545)', cursor: 'pointer' }}
    >
      {/* Slides — always fill container, never smaller than it */}
      {slides.map((s, i) => (
        <div key={i} className={`slide${i === idx ? ' active' : ''}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <img src={s.img} alt={s.nm}
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: `linear-gradient(135deg, ${BADGE_BG[s.cat] || '#1e3a5f'}33, #0a1628)` }}
            onError={e => { e.currentTarget.style.opacity = 0.35; }}
          />
          {/* Dark overlay gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.15) 60%, transparent 100%)' }} />
        </div>
      ))}

      {/* Product info card — bottom left, */}
      <div className="hs-info-wrap" style={{ position: 'absolute', bottom: 28, left: 28, right: 80, zIndex: 6, pointerEvents: 'none' }}>
        <div className="hs-info-card" style={{ background: 'rgba(255,255,255,.93)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '16px 18px', display: 'inline-block', minWidth: 200, maxWidth: 300 }}>
          <div className="hs-info-cat" style={{ fontSize: 9, fontWeight: 800, color: BADGE_BG[slide.cat] || '#6366f1', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5 }}>
            {slide.cat}
          </div>
          <div className="hs-info-name" style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 4 }}>{slide.nm}</div>
          <div className="hs-info-brand" style={{ fontSize: 11, color: '#475569', marginBottom: 7 }}>{slide.br}</div>
          <div className="hs-info-price" style={{ fontSize: 20, fontWeight: 900, color: 'var(--teal)', fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
            {slide.pr}
          </div>
        </div>
      </div>

      {/* ‹ › nav arrows */}
      {['‹', '›'].map((ch, i) => (
        <button key={i}
          className="hs-arrow"
          onClick={e => { e.stopPropagation(); goSlide(i === 0 ? idx - 1 : idx + 1); }}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [i === 0 ? 'left' : 'right']: 14, zIndex: 8,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,.3)', color: '#fff', cursor: 'pointer',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: '.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
        >{ch}</button>
      ))}

      {/* Dots */}
      <div className="hs-dots" style={{ position: 'absolute', bottom: 12, right: 18, display: 'flex', gap: 5, zIndex: 8 }}>
        {slides.map((_, i) => (
          <button key={i}
            onClick={e => { e.stopPropagation(); goSlide(i); }}
            style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? 'var(--teal)' : 'rgba(255,255,255,.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s' }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Category Row ─── */
const CATS = [
  { icon: '🛒', label: 'All Products',  labelAr: 'جميع المنتجات', cat: '' },
  { icon: '🔬', label: 'Restorative',   labelAr: 'حشوات وترميمية', cat: 'RESTORATIVE' },
  { icon: '🔩', label: 'Endodontics',   labelAr: 'علاج الجذور',   cat: 'ENDODONTICS' },
  { icon: '⚙️', label: 'Handpieces',    labelAr: 'قبضات وتوربينات', cat: 'HANDPIECES' },
  { icon: '🦷', label: 'Dental Units',  labelAr: 'وحدات وكراسي', cat: 'DENTAL UNITS' },
  { icon: '🧪', label: 'Sterilization', labelAr: 'أجهزة تعقيم', cat: 'STERILIZATION' },
  { icon: '📡', label: 'Imaging',       labelAr: 'أشعة وتصوير', cat: 'IMAGING' },
  { icon: '🌿', label: 'Periodontics',  labelAr: 'علاج اللثة', cat: 'PERIODONTICS' },
  { icon: '😁', label: 'Orthodontics',  labelAr: 'تقويم أسنان', cat: 'ORTHODONTICS' },
  { icon: '🔪', label: 'Surgical',      labelAr: 'أدوات جراحة', cat: 'SURGICAL' },
];

function CategoryRow({ isAr }) {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const scroll = dir => rowRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => scroll(-1)}
        style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--b2)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>◀</button>
      <div ref={rowRef} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', flex: 1, paddingBottom: 2 }}>
        {CATS.map(c => (
          <button key={c.cat}
            onClick={() => navigate(c.cat ? `/shop?cat=${encodeURIComponent(c.cat)}` : '/shop')}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 9, padding: '10px 18px', background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 50, cursor: 'pointer', transition: '.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = 'rgba(78,204,163,.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b2)'; e.currentTarget.style.background = 'var(--card)'; }}>
            <span style={{ fontSize: 20 }}>{c.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{isAr ? c.labelAr : c.label}</span>
          </button>
        ))}
      </div>
      <button onClick={() => scroll(1)}
        style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--b2)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>▶</button>
    </div>
  );
}

/* ─── SHARK Points Earn Cards ─── */
const SP_WAYS = [
  { icon: '🛒', title: 'Shopping',  titleAr: 'التسوق',    desc: '1 point per 10 EGP spent',      descAr: '١ نقطة لكل ١٠ جنيهات' },
  { icon: '🔧', title: 'Repairs',   titleAr: 'الصيانة',   desc: '2× points on service bookings',  descAr: 'ضعف النقاط على حجوزات الصيانة' },
  { icon: '⭐', title: 'Reviews',   titleAr: 'التقييمات', desc: '50 points per verified review',   descAr: '٥٠ نقطة لكل تقييم موثق' },
  { icon: '👥', title: 'Referrals', titleAr: 'الترشيحات', desc: '200 points per referred doctor',  descAr: '٢٠٠ نقطة لكل طبيب ترشحه' },
];

/* ─── Main Home Page ─── */
export default function HomePage() {
  const { isAr } = useLanguage();
  const { products, team, loading } = useProducts();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const countdown = useCountdown(2 * 3600 + 45 * 60 + 11);
  const [selectedMember, setSelectedMember] = useState(null);

  const flashDeals = useMemo(() => products.filter(p => p.badge === 'hot' || p.badge === 'sale' || p.badge === 'new').slice(0, 4), [products]);
  const featured = useMemo(() => products.filter(p => p.rating >= 4.7).slice(0, 8), [products]);

  const STATS = [
    { num: '500+', lbl: isAr ? 'المنتجات' : 'PRODUCTS' },
    { num: '27',   lbl: isAr ? 'المحافظات' : 'GOVERNORATES' },
    { num: '98%',  lbl: isAr ? 'نسبة الرضا' : 'SATISFACTION' },
    { num: '10+',  lbl: isAr ? 'سنوات خبرة' : 'YRS EXP' },
  ];

  return (
    <div style={{ paddingTop: 64 }}>

      {/* ── HERO: split ── */}
      <section className="hero" style={{ display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '60px 48px', gap: 48 }}>
        <div className="hero-grid" />

        {/* Left text column */}
        <div className="hero-text" style={{ flex: '0 0 auto', maxWidth: 540, zIndex: 3 }}>
          {/* Small top pills: free shipping + flash timer, side by side */}
          <div className="hero-top-pills">
            <div className="free-ship-badge">
              🚚 {isAr ? 'شحن مجاني فوق ٥٠٠ ج.م' : 'Free shipping over 500 EGP'}
            </div>
            <div className="hero-timer-pill">
              ⚡ {countdown.h}:{countdown.m}:{countdown.s}
            </div>
          </div>

          <h1>
            {isAr ? <>سوق الأسنان <span className="accent">الأول</span><br />في مصر</> : <>EGYPT&apos;S <span className="accent">#1</span><br />DENTAL<br />MARKETPLACE</>}
          </h1>
          <p>
            {isAr ? 'معدات ومستلزمات طب الأسنان الاحترافية مع صيانة معتمدة — موثوق به من قبل أكثر من ٥٠٠٠ طبيب أسنان في مصر.' : "Professional dental equipment, supplies & certified repair services — trusted by Egypt's leading clinics and over 5,000 dental professionals nationwide."}
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/shop')}>🛍️ {isAr ? 'تسوق المعدات' : 'Shop Equipment'}</button>
            <button className="btn-outline btn-purple" onClick={() => navigate('/engineers')}>🔧 {isAr ? 'صيانة معتمدة' : 'Cert. Service'}</button>
            <button className="btn-outline" onClick={() => navigate('/ai-scanner')} style={{ borderColor: 'rgba(139,92,246,.4)', color: '#a78bfa' }}>🤖 {isAr ? 'الذكاء الاصطناعي' : 'AI Scanner'}</button>
          </div>
          <button className="shark-pts-hero" onClick={() => navigate('/shark-points')}>
            ⚡ SHARK Points
          </button>
          {/* Stats row */}
          <div className="hero-stats" style={{ marginTop: 40, paddingTop: 28 }}>
            {STATS.map(s => (
              <div key={s.lbl} style={{ textAlign: 'center' }}>
                <div className="hs-num">{s.num}</div>
                <div className="hs-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Slideshow */}
        <div className="hero-slideshow-wrap" style={{ flex: 1, minWidth: 0, maxWidth: 680, height: 500, zIndex: 3 }}>
          <HeroSlideshow isAr={isAr} />
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="sec" style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div className="sec-head" style={{ marginBottom: 20 }}>
          <div>
            <div className="sec-label">{isAr ? 'تصفح' : 'BROWSE'}</div>
            <div className="sec-title">
              {isAr ? 'تسوق حسب ' : 'SHOP BY '}<span>{isAr ? 'الفئة' : 'CATEGORY'}</span>
            </div>
          </div>
          <button className="btn-viewall" onClick={() => navigate('/shop')}>
            {isAr ? 'عرض الكل ←' : 'View All →'}
          </button>
        </div>
        <CategoryRow isAr={isAr} />
        {/* Empty space beneath category row gap */}
        <div style={{ height: 40 }} />
      </section>

      {/* ── FLASH DEALS ── */}
      {flashDeals.length > 0 && (
        <div style={{ padding: '0 32px 48px' }}>
          <div className="flash-wrap">
            <div className="flash-head">
              <span style={{ fontSize: 22 }}>⚡</span>
              <h2>
                {isAr ? 'عروض' : 'FLASH'} <span style={{ color: 'var(--teal)' }}>{isAr ? 'خاطفة' : 'DEALS'}</span>
              </h2>
              <div className="flash-timer" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700 }}>Ends in:</span>
                <TimerSeg val={countdown.h} label="HRS" />
                <span style={{ fontSize: 20, color: 'var(--text3)', fontWeight: 700 }}>:</span>
                <TimerSeg val={countdown.m} label="MIN" />
                <span style={{ fontSize: 20, color: 'var(--text3)', fontWeight: 700 }}>:</span>
                <TimerSeg val={countdown.s} label="SEC" />
              </div>
            </div>
            <div className="prod-grid">
              {flashDeals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      <section className="sec">
        <div className="sec-head">
          <div>
            <div className="sec-label">{isAr ? 'أفضل خياراتنا' : 'TOP PICKS'}</div>
            <div className="sec-title">
              {isAr ? 'منتجات' : 'FEATURED'} <span>{isAr ? 'مميزة' : 'PRODUCTS'}</span>
            </div>
          </div>
          <button className="btn-viewall" onClick={() => navigate('/shop')}>{isAr ? 'عرض الكل ←' : 'View All →'}</button>
        </div>
        {loading
          ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading products…</div>
          : <div className="prod-grid">{featured.map(p => <ProductCard key={p.id} product={p} />)}</div>
        }
      </section>

      {/* ── SHARK POINTS section ── */}
      <section className="shark-pts-section sec">
        <div className="sec-head" style={{ marginBottom: 28 }}>
          <div>
            <div className="sec-label" style={{ color: 'var(--gold)' }}>{isAr ? 'برنامج الولاء' : 'LOYALTY PROGRAM'}</div>
            <div className="sec-title">{isAr ? <>نقاط <span style={{ color: 'var(--gold)' }}>SHARK</span></> : <>SHARK <span style={{ color: 'var(--gold)' }}>POINTS</span></>}</div>
          </div>
          <button className="btn-viewall" style={{ color: 'var(--gold)', borderColor: 'rgba(245,158,11,.3)' }} onClick={() => navigate('/shark-points')}>
            {isAr ? 'عرض نقاطي ←' : 'View My Points →'}
          </button>
        </div>
        <div className="sp-cards">
          {SP_WAYS.map(c => (
            <div key={c.title} className="sp-card">
              <div className="sp-card-icon">{c.icon}</div>
              <div className="sp-card-title">{isAr ? c.titleAr : c.title}</div>
              <div className="sp-card-desc">{isAr ? c.descAr : c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      {team.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="sec-head" style={{ marginBottom: 24 }}>
            <div>
              <div className="sec-label">{isAr ? 'فريقنا المتميز' : 'OUR PEOPLE'}</div>
              <div className="sec-title">{isAr ? <>تعرف على <span>فريقنا</span></> : <>MEET THE <span>TEAM</span></>}</div>
            </div>
          </div>
          <div className="team-grid">
            {team.slice(0, 6).map(m => (
              <div key={m._id || m.uid || m.id} className="team-card" style={{ textAlign: 'center', padding: 20, cursor: 'pointer' }}
                onClick={() => setSelectedMember(m)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setSelectedMember(m); }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: m.color || 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>
                  {m.initials || (m.name || '?')[0]}
                </div>
                <div className="team-name">{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, marginTop: 3 }}>{m.dept || m.role}</div>
                {m.phone && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{m.phone}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <UserProfileModal
        user={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        showActions={false}
        isAr={isAr}
      />
    </div>
  );
}
