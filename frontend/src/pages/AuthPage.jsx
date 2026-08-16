import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../hooks/useLanguage';

// Roles a new user can self-register as — Admin/Staff are assigned, not self-selected.
const SIGNUP_ROLES = [
  { id: 'Dentist',  labelAr: 'طبيب أسنان' },
  { id: 'Vendor',   labelAr: 'مورد' },
  { id: 'Student',  labelAr: 'طالب' },
  { id: 'Engineer', labelAr: 'مهندس' },
];

// Full role set shown as tiles on the login screen, matching the account types
// the backend's login validation chain checks against.
const LOGIN_ROLES = [
  { id: 'Dentist',  icon: '🦷', labelAr: 'طبيب أسنان' },
  { id: 'Vendor',   icon: '📦', labelAr: 'مورد' },
  { id: 'Student',  icon: '🎓', labelAr: 'طالب' },
  { id: 'Admin',    icon: '⚙️', labelAr: 'مدير' },
  { id: 'Staff',    icon: '👤', labelAr: 'موظف' },
  { id: 'Engineer', icon: '🔧', labelAr: 'مهندس' },
];

const FEATURES = [
  { icon: '📦', text: '500+ verified products from global dental brands', textAr: '٥٠٠+ منتج موثق من علامات عالمية' },
  { icon: '🤖', text: 'AI Smart Scanner — panoramic X-ray diagnostics', textAr: 'ماسح ذكي بالذكاء الاصطناعي للأشعة البانورامية' },
  { icon: '🚚', text: 'Fast delivery to all 27 Egyptian governorates', textAr: 'توصيل سريع لجميع محافظات مصر الـ٢٧' },
  { icon: '🔧', text: 'Certified equipment repair by Eng. Mohamed Kotb', textAr: 'صيانة معتمدة بواسطة المهندس محمد كتب' },
  { icon: '⚡', text: 'SHARK Points — earn on every purchase', textAr: 'نقاط SHARK — اكسب مع كل عملية شراء' },
];

/* ── Signup Popup Modal ── */
function SignupModal({ open, onClose, onSwitchToLogin }) {
  const { isAr } = useLanguage();
  const { register, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ name: '', role: 'Dentist', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    setLoading(true); setError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast(isAr ? 'تم إنشاء الحساب — مرحباً بك في دنتال شارك! 🦷' : 'Account created — welcome to DentalShark! 🦷', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || (isAr ? 'فشل إنشاء الحساب.' : 'Registration failed.'));
    } finally { setLoading(false); }
  };

  const onKey = e => { if (e.key === 'Enter') handleRegister(); };

  if (!open) return null;

  return (
    <div className="auth-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-bg-grid" />
      <div className="auth-card">
        <div className="auth-card-head">
          <h2>✨ {isAr ? 'إنشاء حساب جديد' : 'Create Your Account'}</h2>
          <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="auth-subtitle">
          {isAr ? 'انضم إلى أكثر من ٥٠٠٠ متخصص أسنان في مصر' : 'Join 5,000+ dental professionals in Egypt'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <div className="auth-row-2">
            <div className="ff">
              <label>{isAr ? 'الاسم الكامل' : 'FULL NAME'}</label>
              <input className="fi" placeholder={isAr ? 'د. أحمد حسن' : 'Dr. Ahmed Hassan'}
                value={form.name} onChange={e => up('name', e.target.value)} onKeyDown={onKey} />
            </div>
            <div className="ff">
              <label>{isAr ? 'الدور' : 'ROLE'}</label>
              <select className="fi" value={form.role} onChange={e => up('role', e.target.value)}>
                {SIGNUP_ROLES.map(r => <option key={r.id} value={r.id}>{isAr ? r.labelAr : r.id}</option>)}
              </select>
            </div>
          </div>

          <div className="ff">
            <label>{isAr ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}</label>
            <input className="fi" type="email" placeholder="dr.ahmed@clinic.eg"
              value={form.email} onChange={e => up('email', e.target.value)} onKeyDown={onKey} />
          </div>

          <div className="ff">
            <label>{isAr ? 'كلمة المرور' : 'PASSWORD'}</label>
            <input className="fi" type="password" placeholder="••••••••"
              value={form.password} onChange={e => up('password', e.target.value)} onKeyDown={onKey} />
            <div className="auth-pw-hint">
              {isAr ? '٨ أحرف على الأقل، حرف كبير وصغير ورقم ورمز خاص' : '8+ characters with uppercase, lowercase, number & symbol'}
            </div>
          </div>

          <button className="btn-login" onClick={handleRegister} disabled={loading}>
            {loading ? (isAr ? 'جاري التحميل...' : 'Please wait…') : (isAr ? 'إنشاء الحساب ←' : 'Create Account →')}
          </button>
        </div>

        <p className="auth-terms">
          {isAr ? 'بالتسجيل، فإنك توافق على ' : 'By signing up, you agree to our '}
          <a>{isAr ? 'الشروط والأحكام' : 'Terms and Conditions'}</a>
        </p>

        <div className="login-links" style={{ marginTop: 10 }}>
          {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
          <a onClick={onSwitchToLogin}>{isAr ? 'تسجيل الدخول' : 'Sign In'}</a>
        </div>
      </div>
    </div>
  );
}

/* ── Main Login Page — full split-screen, matches video exactly ── */
export default function AuthPage() {
  const { isAr } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('Dentist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupOpen, setSignupOpen] = useState(false);
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password');
      return;
    }
    setLoading(true); setError('');
    try {
      const u = await login({ email: form.email, password: form.password, selectedRole });
      toast(`${isAr ? 'مرحباً بعودتك' : 'Welcome back'}, ${u.name}! 👋`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || (isAr ? 'فشل تسجيل الدخول. تحقق من بياناتك.' : 'Login failed. Check your credentials.'));
    } finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setLoading(true); setError('');
    try { await login({ guest: true }); navigate(from, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const onKey = e => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div id="login-screen">
      {/* ── LEFT PANEL — shark logo + tagline + feature list ── */}
      <div className="login-left">
        <div className="ll-grid" />
        <div className="ll-content">
          <img
            src="/logo.png"
            alt="DentalShark"
            className="ll-logo-img"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="ll-brand">Dental<span>Shark</span></div>
          <p className="ll-tagline">
            {isAr ? 'حيث تجد كل ابتسامة تميزها' : 'Where Every Smile Gets Its Edge'}
          </p>
          <div className="free-ship-badge" style={{ justifyContent: 'center', margin: '0 auto 28px' }}>
            🚚 {isAr ? 'شحن مجاني لجميع المحافظات الـ٢٧' : 'Free shipping across all 27 governorates'}
          </div>

          <div className="ll-features">
            {FEATURES.map(f => (
              <div key={f.text} className="ll-feature-row">
                <span className="ll-feature-icon">{f.icon}</span>
                <span>{isAr ? f.textAr : f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — plain email/password login ── */}
      <div className="login-right">
        <div className="login-right-mobile-brand">
          <img src="/logo.png" alt="DentalShark" onError={e => { e.currentTarget.style.display = 'none'; }} />
          <span className="ll-brand" style={{ fontSize: 22, marginBottom: 0 }}>Dental<span>Shark</span></span>
        </div>
        <h2>{isAr ? 'مرحباً بعودتك' : 'Welcome Back'} 👋</h2>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          {isAr ? 'سجّل الدخول إلى حساب DentalShark الخاص بك' : 'Sign in to your DentalShark account'}
        </p>

        <div className="login-role-tiles" role="tablist" aria-label={isAr ? 'نوع الحساب' : 'Account type'}>
          {LOGIN_ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selectedRole === r.id}
              className={`login-role-tile${selectedRole === r.id ? ' active' : ''}`}
              onClick={() => setSelectedRole(r.id)}
            >
              <span className="login-role-icon">{r.icon}</span>
              <span>{isAr ? r.labelAr : r.id}</span>
            </button>
          ))}
        </div>

        {error && <div className="auth-error" style={{ width: '100%', maxWidth: 360, boxSizing: 'border-box' }}>{error}</div>}

        <div className="auth-form" style={{ width: '100%', maxWidth: 360 }}>
          <div className="ff">
            <label>{isAr ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}</label>
            <input className="fi" type="email" placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              value={form.email} onChange={e => up('email', e.target.value)} onKeyDown={onKey} />
          </div>

          <div className="ff">
            <label>{isAr ? 'كلمة المرور' : 'PASSWORD'}</label>
            <div className="pw-wrap">
              <input className="fi" type={showPw ? 'text' : 'password'} placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                value={form.password} onChange={e => up('password', e.target.value)} onKeyDown={onKey} />
              <button type="button" className="pw-eye" onClick={() => setShowPw(s => !s)}>{showPw ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div className="fex">
            <label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> {isAr ? 'تذكرني' : 'Remember me'}</label>
            <a>{isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}</a>
          </div>

          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? (isAr ? 'جاري التحميل...' : 'Please wait…') : (isAr ? 'تسجيل الدخول ←' : 'Sign In →')}
          </button>

          <button type="button" className="btn-guest" onClick={handleGuest} disabled={loading}>
            {isAr ? 'المتابعة كزائر' : 'Continue as Guest'}
          </button>
        </div>

        <div className="login-links">
          {isAr ? 'مستخدم جديد؟ ' : 'New here? '}
          <a onClick={() => setSignupOpen(true)}>{isAr ? 'إنشاء حساب' : 'Sign Up'}</a>
        </div>
      </div>

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => setSignupOpen(false)}
      />
    </div>
  );
}
