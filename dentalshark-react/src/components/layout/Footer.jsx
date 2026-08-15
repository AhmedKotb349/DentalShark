import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';

export default function Footer({ onShowInfo }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const subscribe = () => {
    if (!email.trim()) return;
    toast(t('footer.subscribed'), 'success');
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <Link to="/" className="footer-logo-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="DentalShark" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <div className="nav-logo-name">Dental<span>Shark</span></div>
          </Link>
          <div className="footer-ship-banner">{t('footer.shippingBanner')}</div>
          <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 240, marginTop: 10 }}>{t('footer.tagline')}</p>
          <button className="footer-pts-pill" onClick={() => navigate('/shark-points')}>
            <span className="footer-pts-pill-icon">⚡</span>
            <span>{t('footer.sharkPoints').replace(' ⚡', '')}</span>
          </button>
        </div>
        <div className="footer-col">
          <h4>{t('footer.quickLinks')}</h4>
          <Link to="/shop">{t('footer.shopAll')}</Link>
          <Link to="/shop?deal=flash">{t('footer.flashDeals')}</Link>
          <Link to="/ai-scanner">{t('footer.aiScanner')}</Link>
          <Link to="/engineers">{t('footer.engineers')}</Link>
          <Link to="/wishlist">{t('footer.myWishlist')}</Link>
          <Link to="/shark-points">{t('footer.sharkPoints')}</Link>
        </div>
        <div className="footer-col">
          <h4>{t('footer.support')}</h4>
          <Link to="/contact">{t('footer.contactUs')}</Link>
          <a onClick={() => onShowInfo('faq')}>{t('footer.faq')}</a>
          <a onClick={() => onShowInfo('returns')}>{t('footer.returns')}</a>
          <a onClick={() => onShowInfo('track')}>{t('footer.trackOrder')}</a>
          <a onClick={() => onShowInfo('warranty')}>{t('footer.warranty')}</a>
          <a onClick={() => onShowInfo('payment')}>{t('footer.paymentMethods')}</a>
        </div>
        <div className="footer-col">
          <h4>{t('footer.newsletter')}</h4>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 9 }}>{t('footer.newsletterDesc')}</p>
          <div className="nl-form">
            <input
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && subscribe()}
            />
            <button onClick={subscribe}>{t('footer.subscribe')}</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t('footer.copyright')}</span>
        <span>{t('footer.madeIn')}</span>
      </div>
    </footer>
  );
}
