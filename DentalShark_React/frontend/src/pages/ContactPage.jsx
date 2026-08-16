import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../context/ToastContext';
import { USERS } from '../data';

const SUBJECTS = ['Product Inquiry', 'Order Support', 'Equipment Repair', 'Partnership / Vendor', 'Technical Support', 'Other'];

export default function ContactPage() {
  const { isAr } = useLanguage();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Product Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) { toast('Please fill all required fields', 'warn'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    toast(isAr ? '✅ تم إرسال رسالتك — سنتواصل معك خلال ٢٤ ساعة!' : '✅ Message sent — we\'ll be in touch within 24 hours!', 'success');
    setForm({ name: '', email: '', phone: '', subject: 'Product Inquiry', message: '' });
    setLoading(false);
  };

  const contacts = [
    { icon: '📞', color: '#22c55e', label: 'PHONE', val: '+20 100 123 4567', sub: 'Sun–Thu 9AM–6PM' },
    { icon: '📧', color: '#6366f1', label: 'EMAIL', val: 'info@dentalshark.eg', sub: 'Reply within 24h' },
    { icon: '💬', color: '#8b5cf6', label: 'WHATSAPP', val: '+20 100 123 4567', sub: 'Quick responses' },
    { icon: '📍', color: '#ef4444', label: 'ADDRESS', val: 'Alexandria, Egypt', sub: 'All 27 Governorates' },
  ];

  const teamContacts = USERS.filter(u => ['owner', 'eng'].includes(u.id));

  return (
    <div style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero header */}
      <div style={{ textAlign: 'center', padding: '64px 32px 48px', background: 'linear-gradient(180deg,var(--bg2),var(--bg))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--b2)', border: '1px solid var(--b2)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 18, letterSpacing: 1.5 }}>
          📞 {isAr ? 'تواصل معنا' : 'GET IN TOUCH'}
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, letterSpacing: 4, lineHeight: 1, marginBottom: 16 }}>
          CONTACT <span style={{ color: 'var(--teal)' }}>US</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 520, margin: '0 auto' }}>
          {isAr ? 'هل لديك استفسار عن المنتجات أو الصيانة أو طلبك؟ فريقنا جاهز لمساعدتك خلال ٢٤ ساعة.' : "Have questions about products, repairs, or your order? Our team is ready to help you within 24 hours."}
        </p>
      </div>

      <div className="sec contact-2col" style={{ paddingTop: 32 }}>
        {/* Left: form */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            {isAr ? 'أرسل رسالة' : 'SEND A MESSAGE'}
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'var(--text)', marginBottom: 24 }}>
            {isAr ? "يسعدنا التواصل معك" : <>WE&apos;D LOVE TO <span style={{ color: 'var(--teal)' }}>HEAR FROM YOU</span></>}
          </h2>

          <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 24 }}>
            <div className="contact-form-grid">
              {[
                { key: 'name',  label: isAr ? 'اسمك' : 'YOUR NAME',  ph: 'Dr. Ahmed Hassan' },
                { key: 'email', label: 'EMAIL', ph: 'dr.ahmed@clinic.eg', type: 'email' },
                { key: 'phone', label: isAr ? 'رقم الهاتف' : 'PHONE', ph: '+20 1xx xxx xxxx' },
              ].map(f => (
                <div key={f.key} style={f.key === 'phone' ? {} : {}}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{f.label}</div>
                  <input className="fi" type={f.type || 'text'} placeholder={f.ph} value={form[f.key]} onChange={e => up(f.key, e.target.value)} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{isAr ? 'الموضوع' : 'SUBJECT'}</div>
                <select className="fi" value={form.subject} onChange={e => up('subject', e.target.value)} style={{ appearance: 'auto' }}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{isAr ? 'الرسالة' : 'MESSAGE'}</div>
              <textarea className="fi" rows={5} placeholder={isAr ? 'كيف يمكننا مساعدتك...' : 'How can we help you...'}
                value={form.message} onChange={e => up('message', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button className="btn-primary" onClick={handleSend} disabled={loading} style={{ width: '100%', marginTop: 16 }}>
              {loading ? (isAr ? 'جاري الإرسال...' : 'Sending…') : (isAr ? '📩 إرسال الرسالة' : '📩 Send Message')}
            </button>
          </div>
        </div>

        {/* Right: contact info */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            {isAr ? 'تواصل معنا مباشرة' : 'DIRECT CONTACTS'}
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'var(--text)', marginBottom: 24 }}>
            {isAr ? "معلومات" : "CONTACT"} <span style={{ color: 'var(--teal)' }}>{isAr ? 'التواصل' : 'INFORMATION'}</span>
          </h2>

          {/* 2x2 contact cards */}
          <div className="contact-info-grid">
            {contacts.map(c => (
              <div key={c.label} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: c.color, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Direct contacts section */}
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>{isAr ? 'التواصل المباشر' : 'DIRECT CONTACTS'}</div>
          {teamContacts.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {u.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{u.name}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 1 }}>{u.dept}</div>
              </div>
              <button style={{ padding: '7px 16px', background: u.id === 'owner' ? 'var(--teal)' : 'var(--b2)', border: 'none', borderRadius: 8, color: u.id === 'owner' ? '#000' : 'var(--text)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                {u.id === 'owner' ? 'Call' : 'Book Repair'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
