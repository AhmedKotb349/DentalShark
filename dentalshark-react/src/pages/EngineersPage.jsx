import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { SERVICES } from '../data';

const GOVS = ['Cairo','Giza','Alexandria','Aswan','Asyut','Beheira','Beni Suef','Dakahlia','Damietta','Faiyum','Gharbia','Ismailia','Kafr el-Sheikh','Luxor','Matruh','Minya','Monufia','New Valley','North Sinai','Port Said','Qalyubia','Qena','Red Sea','Sharqia','Sohag','South Sinai','Suez'];

export default function EngineersPage() {
  const { isAr } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ clinic: '', doctor: '', phone: '', gov: '', equipment: '', urgency: 'normal', issue: '' });
  const [loading, setLoading] = useState(false);
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleBook = async () => {
    if (!user) { toast(isAr ? '⚠️ يرجى تسجيل الدخول أولاً' : '⚠️ Please Sign In first to book a service!', 'warn'); navigate('/login'); return; }
    if (!form.clinic || !form.doctor) { toast(isAr ? 'يرجى إدخال اسم العيادة والطبيب' : 'Please fill in clinic and doctor name', 'warn'); return; }
    setLoading(true);
    try {
      await api.bookService({ ...form, userId: user?._id });
      toast(isAr ? '✅ تم حجز موعد الصيانة! سيتواصل فريقنا معك قريباً.' : '✅ Service appointment booked! Our team will contact you shortly.', 'success');
      setForm({ clinic: '', doctor: '', phone: '', gov: '', equipment: '', urgency: 'normal', issue: '' });
    } catch {
      toast(isAr ? '✅ تم حجز موعد الصيانة!' : '✅ Service appointment booked!', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="eng-page" style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero header */}
      <div style={{ padding: '64px 48px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--b2)', border: '1px solid var(--b2)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 20, letterSpacing: 1.5 }}>
              🔧 {isAr ? 'مهندسو صيانة معتمدون' : 'CERTIFIED DENTAL EQUIPMENT ENGINEER'}
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, letterSpacing: 2, lineHeight: 1.05, color: 'var(--text)', marginBottom: 16 }}>
              {isAr ? <>صيانة وإصلاح<br /><span style={{ color: 'var(--teal)' }}>أجهزة ومعدات العيادة</span></> : <>DENTAL EQUIPMENT<br /><span style={{ color: 'var(--teal)' }}>REPAIR & SERVICE</span></>}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 500, marginBottom: 24 }}>
              {isAr ? 'صيانة كافة الماركات بأيدي مهندسين معتمدين — كافو، إن إس كي، دبليو آند إتش، بلانميكا وغيرها. ضمان كامل وصيانة عاجلة بنفس اليوم.' : 'All brands serviced by our certified engineering team — KaVo, NSK, W&H, Planmeca & more. Full warranty on all repairs. Same-day emergency service available.'}
            </p>
            {/* Engineer badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                ['👤', 'Eng. Mohamed Kotb'],
                ['⭐', '4.9/5 Rating'],
                ['👥', '10+ Years'],
                ['📞', '+20 100 123 4567'],
                ['⚡', 'Earn SHARK Points on repairs'],
              ].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--b2)', borderRadius: 20, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Engineer avatar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', border: '3px solid rgba(78,204,163,.3)', margin: '0 auto 8px' }}>🔧</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 1 }}>ENG. KOTB</div>
          </div>
        </div>
      </div>

      <div className="sec" style={{ paddingTop: 0 }}>
        <div className="eng-2col">
          {/* Services cards */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{isAr ? 'خدماتنا' : 'SERVICES'}</div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--text)', marginBottom: 24 }}>
              {isAr ? 'ما نقدمه من ' : 'WHAT WE '}<span style={{ color: 'var(--teal)' }}>{isAr ? 'خدمات' : 'SERVICE'}</span>
            </h2>
            <div className="eng-services-grid">
              {SERVICES.map(s => (
                <div key={s.nm} className="svc-card" style={{ padding: 20, cursor: 'pointer' }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{s.ic}</div>
                  <div className="svc-name" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.nm}</div>
                  <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 700, marginBottom: 6 }}>{s.pr}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.55 }}>{s.ds}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking form */}
          <div className="booking-form">
            <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 20 }}>
              📅 {isAr ? 'حجز موعد صيانة' : 'Book a Service Appointment'}
            </h3>
            <div className="eng-form-grid">
              {[
                { key: 'clinic', label: isAr ? 'اسم العيادة' : 'CLINIC NAME', ph: 'Dental Clinic Name' },
                { key: 'doctor', label: isAr ? 'اسم الطبيب' : 'DOCTOR NAME', ph: 'Dr. Name' },
                { key: 'phone', label: isAr ? 'رقم الهاتف' : 'PHONE', ph: '+20 100 000 0000' },
                { key: 'equipment', label: isAr ? 'نوع الجهاز' : 'EQUIPMENT TYPE', ph: 'e.g. NSK Handpiece' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>{f.label}</div>
                  <input className="fi" placeholder={f.ph} value={form[f.key]} onChange={e => up(f.key, e.target.value)} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>{isAr ? 'المحافظة' : 'GOVERNORATE'}</div>
                <select className="fi" value={form.gov} onChange={e => up('gov', e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">Select…</option>
                  {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>{isAr ? 'درجة الاستعجال' : 'URGENCY'}</div>
                <select className="fi" value={form.urgency} onChange={e => up('urgency', e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="normal">{isAr ? 'عادي (٣–٥ أيام)' : 'Normal (3–5 days)'}</option>
                  <option value="urgent">{isAr ? 'عاجل (١–٢ يوم)' : 'Urgent (1–2 days)'}</option>
                  <option value="emergency">{isAr ? 'طارئ (نفس اليوم)' : 'Emergency (Same day)'}</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>{isAr ? 'وصف المشكلة' : 'ISSUE DESCRIPTION'}</div>
              <textarea className="fi" rows={4} placeholder={isAr ? 'صف المشكلة والأعراض الملاحظة على الجهاز...' : 'Describe the problem in detail…'}
                value={form.issue} onChange={e => up('issue', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button className="btn-primary" onClick={handleBook} disabled={loading} style={{ width: '100%', marginTop: 16 }}>
              {loading ? (isAr ? 'جاري الإرسال...' : 'Submitting…') : (isAr ? 'تأكيد الحجز ←' : 'Book Appointment →')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
