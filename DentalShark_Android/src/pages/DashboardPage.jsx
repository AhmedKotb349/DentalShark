import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../lib/api';
import { formatPrice, formatDate } from '../lib/format';
import { printInvoice } from '../lib/printInvoice';
import { getVisibleNotifs } from '../data';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import UserProfileModal from '../components/ui/UserProfileModal';

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444',
};

/* ─── Overview Panel ─── */
function OverviewPanel({ orders, user, lang, isAr, navigate, t, isStaffOrAdmin, isGuest }) {
  const { wishlist } = useWishlist();
  const pts = user?.sharkPts || 0;
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status?.toLowerCase() === 'pending').length;

  const KPIs = [
    { icon: '🗂️', val: orders.length, label: isAr ? 'طلباتي' : 'My Orders', sub: `${pending} pending`, subColor: 'var(--gold)' },
    { icon: '💰', val: `EGP ${(totalSpent / 1000).toFixed(0)}K`, label: isAr ? 'الإنفاق' : 'Spent', sub: '↑ 8K', subColor: 'var(--green)' },
    { icon: '❤️', val: wishlist.length, label: isAr ? 'المفضلة' : 'Wishlist', sub: wishlist.length > 0 ? (isAr ? `${wishlist.length} في التخفيض` : `${wishlist.length} on sale`) : (isAr ? 'فارغة' : 'Empty'), subColor: '#f87171' },
    { icon: '⚡', val: pts, label: 'SHARK Points', sub: 'Keep earning!', subColor: 'var(--gold)' },
  ];

  return (
    <>
      {/* Points banner */}
      <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28, color: 'var(--gold)' }}>⚡</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: 'var(--gold)', letterSpacing: 2 }}>{pts}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{isAr ? 'رصيد نقاط SHARK' : 'SHARK Points balance'}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>📊 Earned from {orders.length} orders · Keep shopping to earn more!</div>
        </div>
        <button onClick={() => navigate('/shark-points')}
          style={{ padding: '11px 22px', background: 'rgba(245,158,11,.2)', border: '1px solid rgba(245,158,11,.4)', borderRadius: 10, color: 'var(--gold)', fontWeight: 800, cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif' }}>
          Redeem Points →
        </button>
      </div>

      {/* Quick action tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: '🛍️', label: 'Browse Shop', action: () => navigate('/shop') },
          { icon: '🤖', label: 'AI Scanner', action: () => navigate('/ai-scanner') },
          { icon: '🔧', label: 'Book Repair', action: () => navigate('/engineers') },
          { icon: '🔔', label: 'Notifications', action: null },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 10, color: 'var(--text)', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif' }}>
            <span>{btn.icon}</span>{btn.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {KPIs.map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-icon" style={{ fontSize: 22 }}>{k.icon}</div>
            <div className="kpi-val" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36 }}>{k.val}</div>
            <div className="kpi-lbl">{k.label}</div>
            <div style={{ fontSize: 11, color: k.subColor, fontWeight: 600, marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid: Recent Orders + Notifications */}
      <div className="dash-overview-bottom-grid">
        {/* Recent orders */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            📦 Recent Orders
          </div>
          {orders.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text3)' }}>{isAr ? 'لا توجد طلبات بعد' : 'No orders yet'}</div> : (
            orders.slice(0, 5).map(o => (
              <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--b2)' }}>
                <img src={o.items?.[0]?.img} alt="" referrerPolicy="no-referrer" style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }}
                  onError={e => { e.currentTarget.style.opacity = 0.35; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.[0]?.name || 'Order'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{formatDate(o.createdAt, lang)} · #{o.trackingId?.slice(-6) || o._id?.slice(-6)}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: `${STATUS_COLORS[o.status?.toLowerCase()] || 'var(--b2)'}22`, color: STATUS_COLORS[o.status?.toLowerCase()] || 'var(--text3)' }}>
                  {o.status}
                </span>
                <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, background: 'var(--b2)', border: 'none', cursor: 'pointer', color: 'var(--text)', fontWeight: 600 }}>{isAr ? 'تتبع' : 'Track'}</button>
              </div>
            ))
          )}
        </div>

        {/* Notifications */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🔔 Notifications</div>
          {getVisibleNotifs(isStaffOrAdmin, isGuest).map((n, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--b2)' : 'none' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? 'var(--b2)' : 'var(--teal)', flexShrink: 0, marginTop: 5 }} />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4, marginBottom: 2 }}>{n.t}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{n.tm}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Orders Panel ─── */
function OrdersPanel({ orders, isAdmin, lang, isAr, onRefresh, showInfo }) {
  const { toast } = useToast();
  const { runAddItem } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reordering, setReordering] = useState(null);

  // PROTOTYPE: clone a past order's line items into a fresh cart draft ("Reorder")
  const handleReorder = async (order) => {
    setReordering(order._id);
    try {
      const { draft } = await api.reorder(order._id);
      draft.items.forEach(item => runAddItem({
        id: item.id, name: item.name, brand: item.brand, price: item.price, img: item.img, pts: item.pts,
      }, item.qty));
      toast(isAr ? '🔁 تمت إضافة الطلب السابق إلى السلة' : '🔁 Previous order items added to your cart', 'success');
      navigate('/shop');
    } catch (e) {
      toast(e.message || 'Reorder failed', 'error');
    } finally {
      setReordering(null);
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || (o.trackingId || '').toLowerCase().includes(q) || (o.buyerName || '').toLowerCase().includes(q);
    const matchS = !statusFilter || o.status?.toLowerCase() === statusFilter;
    return matchQ && matchS;
  });

  const handleDelete = async id => {
    if (!window.confirm('Delete this order?')) return;
    try { await api.deleteOrder(id); toast('Order deleted', 'success'); onRefresh(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const handleStatus = async (id, status) => {
    try { await api.updateOrder(id, { status }); onRefresh(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {isAdmin && (
          <input placeholder="🔍 Search customer or ID…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180, padding: '9px 14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontSize: 13 }} />
        )}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontSize: 13 }}>
          <option value="">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" description="No orders matching your criteria." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(o => (
            <div key={o._id} className="order-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="order-name" style={{ fontWeight: 800, fontSize: 15, color: 'var(--teal)' }}>#{o.trackingId || o._id?.slice(-8)}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: `${STATUS_COLORS[o.status?.toLowerCase()] || 'var(--b2)'}22`, color: STATUS_COLORS[o.status?.toLowerCase()] || 'var(--text3)' }}>
                      {o.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                    <strong>Buyer:</strong> {o.buyerName || 'Dental Professional'} ·{' '}
                    <strong>Date:</strong> {formatDate(o.createdAt, lang)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    <strong>Tracking:</strong> {o.trackingId} · <strong>Delivery:</strong> 3–5 days
                  </div>
                  {o.address && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}><strong>Shipping Address:</strong> {o.address}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => showInfo && showInfo('track', o.trackingId)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'rgba(78,204,163,.1)', border: '1px solid rgba(78,204,163,.3)', borderRadius: 9, color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    🔍 Track
                  </button>
                  <button onClick={() => handleReorder(o)} disabled={reordering === o._id}
                    title="Clone this order's items into your cart (Prototype pattern)"
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 9, color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    {reordering === o._id ? '…' : '🔁'} {isAr ? 'إعادة الطلب' : 'Reorder'}
                  </button>
                  <button onClick={() => printInvoice({ ...o, customerName: o.customerName || o.buyerName }, { isAr, lang })}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--b2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    🖨️ {isAr ? 'طباعة' : 'Print Invoice'}
                  </button>
                </div>
              </div>
              {/* Items */}
              <div style={{ background: 'var(--bg2)', borderRadius: 9, padding: '10px 14px', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Items purchased:</div>
                {(o.items || []).map((item, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text2)', padding: '2px 0' }}>
                    · ({item.qty || 1}x) - EGP {(item.price || 0).toLocaleString()}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                  Total Paid: <span style={{ color: 'var(--teal)' }}>EGP {(o.total || 0).toLocaleString()}</span>
                </span>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={o.status} onChange={e => handleStatus(o._id, e.target.value)}
                      style={{ padding: '5px 10px', background: 'var(--bg2)', border: `1px solid ${STATUS_COLORS[o.status?.toLowerCase()] || 'var(--b2)'}`, borderRadius: 7, color: 'var(--text)', fontSize: 12 }}>
                      {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => handleDelete(o._id)}
                      style={{ padding: '5px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Profile Panel ─── */
function ProfilePanel({ user, onLogout, navigate }) {
  return (
    <div style={{ maxWidth: 560 }}>
      {/* Profile card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: user?.color?.includes('gradient') ? user.color : (user?.color || '#64748b'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
            {user?.initials || '?'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--teal)' }}>{user?.role} · {user?.dept}</div>
          </div>
        </div>
        <button style={{ padding: '8px 16px', background: 'var(--b2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          Edit Profile
        </button>
      </div>
      {/* Fields */}
      {[['EMAIL', user?.email], ['PHONE', user?.phone]].map(([label, val]) => (
        <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 12, padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 14, color: 'var(--text)' }}>{val || '—'}</div>
        </div>
      ))}
      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ padding: '10px 20px', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 9, color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          🔑 Change Password
        </button>
        <button onClick={onLogout}
          style={{ padding: '10px 20px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

/* ─── Repairs Panel (Engineer/Admin/Staff manage all bookings; others see their own) ─── */
function RepairsPanel({ isAdmin, isAr, navigate }) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBookings(await api.getBookings()); } catch { setBookings([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id, status) => {
    try { await api.updateBooking(id, { status }); load(); }
    catch (e) { toast(e.message || 'Failed to update', 'error'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm(isAr ? 'حذف طلب الصيانة هذا؟' : 'Delete this repair case?')) return;
    try { await api.deleteBooking(id); toast(isAr ? 'تم الحذف' : 'Deleted', 'success'); load(); }
    catch (e) { toast(e.message || 'Failed to delete', 'error'); }
  };

  const STATUS_BADGE = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Completed: '#22c55e', Cancelled: '#ef4444' };

  return (
    <div>
      <button className="btn-primary" onClick={() => navigate('/engineers')} style={{ marginBottom: 18 }}>
        + {isAr ? 'إضافة طلب جديد' : 'Add New Entry'}
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>{isAr ? 'جاري التحميل…' : 'Loading…'}</div>
      ) : bookings.length === 0 ? (
        <EmptyState icon="🔧" title="No repair cases yet"
          description={isAr ? 'اطلب صيانة معتمدة من مهندسينا' : 'Request certified equipment repair from our engineers'}
          action={<button className="btn-primary" onClick={() => navigate('/engineers')} style={{ marginTop: 16 }}>🔧 {isAr ? 'اطلب صيانة' : 'Book a Repair'}</button>}
        />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', fontWeight: 800, fontSize: 13, color: 'var(--teal)', borderBottom: '1px solid var(--b2)' }}>
            {isAr ? 'السجلات النشطة' : 'Active Records'}
          </div>
          {bookings.map(b => (
            <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--b2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18 }}>🔧</span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                  {b.equipment || 'Equipment'} — {b.clinic || b.userName || 'Unknown'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  {b.doctor && <>{b.doctor} · </>}{b.gov && <>{b.gov} · </>}{b.phone}
                  {b.issue && <> · {b.issue}</>}
                </div>
              </div>
              {isAdmin ? (
                <select value={b.status || 'Pending'} onChange={e => handleStatus(b._id, e.target.value)}
                  style={{ padding: '5px 10px', background: 'var(--bg2)', border: `1px solid ${STATUS_BADGE[b.status] || 'var(--b2)'}`, borderRadius: 7, color: 'var(--text)', fontSize: 11.5 }}>
                  {Object.keys(STATUS_BADGE).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${STATUS_BADGE[b.status] || 'var(--b2)'}22`, color: STATUS_BADGE[b.status] || 'var(--text3)' }}>
                  {b.status || 'Pending'}
                </span>
              )}
              {isAdmin && (
                <button onClick={() => handleDelete(b._id)}
                  style={{ padding: '5px 10px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: 7, cursor: 'pointer', fontSize: 11.5 }}>
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Users / Vendors Panel (Admin/Staff) — reused with a role filter ─── */
function UserManagementPanel({ isAr, filterRole, titleKey }) {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: filterRole || 'Dentist' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await api.getUsers();
      const list = (Array.isArray(all) ? all : []).filter(u => u.role !== 'Guest');
      setUsers(filterRole ? list.filter(u => u.role === filterRole) : list);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [filterRole]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast(isAr ? 'الاسم والبريد وكلمة المرور مطلوبة' : 'Name, email and password are required', 'warn'); return;
    }
    setSubmitting(true);
    try {
      await api.createUser(form);
      toast(isAr ? '✅ تمت الإضافة' : '✅ User added', 'success');
      setForm({ name: '', email: '', password: '', phone: '', role: filterRole || 'Dentist' });
      setShowAdd(false);
      load();
    } catch (e) { toast(e.message || 'Failed to add user', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleRemove = async (u) => {
    if (!window.confirm(isAr ? `إزالة ${u.name}؟` : `Remove ${u.name}?`)) return;
    try { await api.deleteUser(u._id); toast(isAr ? 'تمت الإزالة' : 'Removed', 'success'); load(); }
    catch (e) { toast(e.message || 'Failed to remove', 'error'); }
  };

  return (
    <div>
      <button className="btn-primary" onClick={() => setShowAdd(s => !s)} style={{ marginBottom: 16 }}>
        {showAdd ? (isAr ? '✕ إغلاق' : '✕ Close') : `+ ${isAr ? 'إضافة' : 'Add'} ${filterRole || (isAr ? 'مستخدم' : 'User')}`}
      </button>

      {showAdd && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
          <input placeholder={isAr ? 'الاسم' : 'Name'} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <input placeholder={isAr ? 'البريد الإلكتروني' : 'Email'} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <input placeholder={isAr ? 'كلمة المرور' : 'Password'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <input placeholder={isAr ? 'الهاتف' : 'Phone'} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          {!filterRole && (
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }}>
              {['Dentist', 'Vendor', 'Student', 'Engineer', 'Staff', 'Admin'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? '…' : (isAr ? 'حفظ' : 'Save')}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>{isAr ? 'جاري التحميل…' : 'Loading…'}</div>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" description="" />
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, overflow: 'hidden' }}>
          {users.map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid var(--b2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: u.color?.includes('gradient') ? u.color : (u.color || '#64748b'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {u.initials || (u.name || '?')[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email} · {u.role}{u.dept ? ` · ${u.dept}` : ''}</div>
              </div>
              <button onClick={() => handleRemove(u)}
                style={{ padding: '6px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: 7, cursor: 'pointer', fontSize: 11.5, flexShrink: 0 }}>
                {isAr ? 'إزالة' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Products Panel (Admin/Staff — add/remove catalog items) ─── */
function ProductsPanel({ isAr }) {
  const { toast } = useToast();
  const { refresh: refreshCatalog } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', cat2: 'Restorative', price: '', img: '', desc: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await api.getProducts()); } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.price) {
      toast(isAr ? 'الاسم والماركة والسعر مطلوبة' : 'Name, brand and price are required', 'warn'); return;
    }
    setSubmitting(true);
    try {
      await api.createProduct(form);
      toast(isAr ? '✅ تمت إضافة المنتج' : '✅ Product added', 'success');
      setForm({ name: '', brand: '', cat2: 'Restorative', price: '', img: '', desc: '' });
      setShowAdd(false);
      load();
      refreshCatalog();
    } catch (e) { toast(e.message || 'Failed to add product', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleRemove = async (p) => {
    if (!window.confirm(isAr ? `إزالة ${p.name}؟` : `Remove ${p.name}?`)) return;
    try {
      await api.deleteProduct(p.id ?? p.pid);
      toast(isAr ? 'تمت الإزالة' : 'Removed', 'success');
      load();
      refreshCatalog();
    } catch (e) { toast(e.message || 'Failed to remove', 'error'); }
  };

  return (
    <div>
      <button className="btn-primary" onClick={() => setShowAdd(s => !s)} style={{ marginBottom: 16 }}>
        {showAdd ? (isAr ? '✕ إغلاق' : '✕ Close') : `+ ${isAr ? 'إضافة منتج' : 'Add Product'}`}
      </button>

      {showAdd && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
          <input placeholder={isAr ? 'اسم المنتج' : 'Product name'} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <input placeholder={isAr ? 'الماركة' : 'Brand'} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <select value={form.cat2} onChange={e => setForm(f => ({ ...f, cat2: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }}>
            {['Restorative', 'Endodontics', 'Handpieces', 'Periodontics', 'Sterilization', 'Imaging', 'Dental Units', 'Surgical'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder={isAr ? 'السعر (ج.م)' : 'Price (EGP)'} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <input placeholder={isAr ? 'رابط الصورة' : 'Image URL'} value={form.img} onChange={e => setForm(f => ({ ...f, img: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5 }} />
          <textarea placeholder={isAr ? 'الوصف' : 'Description'} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12.5, resize: 'vertical', minHeight: 60 }} />
          <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? '…' : (isAr ? 'حفظ' : 'Save')}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>{isAr ? 'جاري التحميل…' : 'Loading…'}</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, overflow: 'hidden' }}>
          {products.map(p => (
            <div key={p.id || p.pid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--b2)' }}>
              <img src={p.img} alt={p.name} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.opacity = 0.3; }}
                style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.brand} · {p.cat2 || p.cat} · {(p.price || 0).toLocaleString()} EGP</div>
              </div>
              <button onClick={() => handleRemove(p)}
                style={{ padding: '6px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: 7, cursor: 'pointer', fontSize: 11.5, flexShrink: 0 }}>
                {isAr ? 'إزالة' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─── */
const SIDEBAR_ITEMS = [
  { id: 'overview',  icon: '🗂️', label: 'Overview',     labelAr: 'نظرة عامة' },
  { id: 'orders',    icon: '📦', label: 'My Orders',    labelAr: 'طلباتي' },
  { id: 'wishlist',  icon: '❤️', label: 'Wishlist',     labelAr: 'المفضلة' },
  { id: 'repairs',   icon: '🔧', label: 'Repairs',      labelAr: 'الصيانة' },
  { id: 'points',    icon: '⚡', label: 'SHARK Points', labelAr: 'نقاط SHARK' },
  { id: 'profile',   icon: '👤', label: 'Profile',      labelAr: 'الملف الشخصي' },
];
const SIDEBAR_ADMIN = [
  { id: 'admin-orders',   icon: '📋', label: 'Manage Orders',  labelAr: 'إدارة الطلبات' },
  { id: 'admin-products', icon: '🦷', label: 'Manage Products', labelAr: 'إدارة المنتجات' },
  { id: 'admin-users',    icon: '👥', label: 'Users',          labelAr: 'المستخدمون' },
  { id: 'admin-vendors',  icon: '🏭', label: 'Vendors',        labelAr: 'الموردون' },
];
const SIDEBAR_BOTTOM = [
  { id: 'shop',     icon: '🛍️', label: 'Shop',      labelAr: 'المتجر',   nav: '/shop' },
  { id: 'wishlink', icon: '❤️', label: 'Wishlist',  labelAr: 'المفضلة',  nav: null },
  { id: 'pts-link', icon: '⚡', label: 'SHARK Points (0)', labelAr: 'نقاط SHARK', nav: '/shark-points', gold: true },
  { id: 'signout',  icon: '🚪', label: 'Sign Out',  labelAr: 'تسجيل الخروج' },
];

export default function DashboardPage() {
  const { lang, isAr } = useLanguage();
  const { user, isStaffOrAdmin, isGuest, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { showInfo } = useOutletContext() || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try { const data = await api.getOrders(); setOrders(Array.isArray(data) ? data : []); }
    catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [...SIDEBAR_ITEMS, ...(isStaffOrAdmin ? SIDEBAR_ADMIN : [])];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const TAB_TITLES = {
    overview: ['WELCOME,', `${user?.name?.split(' ')[0] || 'User'} 👋`, user?.dept || user?.role, today],
    orders: ['MY ORDERS', '📦', 'Track and manage your purchases', ''],
    profile: ['MY PROFILE', '👤', 'Manage your account', ''],
    points: ['SHARK POINTS', '⚡', 'Your loyalty rewards', ''],
    wishlist: ['MY WISHLIST', '❤️', 'Products you love', ''],
  };

  return (
    <div className="dash-layout">
      {/* Mobile top bar — hidden on desktop via CSS, replaces the sidebar below 992px */}
      <div id="dash-mobile-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="dash-user-av" style={{ width: 28, height: 28, fontSize: 12, background: user?.color?.includes('gradient') ? user.color : (user?.color || '#64748b') }}>
            {user?.initials || '?'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
            {isAr ? (tabs.find(t => t.id === activeTab)?.labelAr || 'القائمة') : (tabs.find(t => t.id === activeTab)?.label || 'Menu')}
          </span>
        </div>
        <button onClick={() => setMobileNavOpen(true)} aria-label="Open dashboard menu"
          style={{ background: 'var(--b2)', border: '1px solid var(--b2)', borderRadius: 8, width: 36, height: 36, fontSize: 16, color: 'var(--text)', cursor: 'pointer' }}>
          ☰
        </button>
      </div>

      {/* Mobile dashboard menu — tap-to-open popup list, mirrors the sidebar's links */}
      <Modal open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title={isAr ? 'القائمة' : 'Dashboard Menu'} maxWidth={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(tab => (
            <button key={tab.id} className={`dash-link${activeTab === tab.id ? ' active' : ''}`}
              style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
              onClick={() => {
                setMobileNavOpen(false);
                if (tab.id === 'pts-link') navigate('/shark-points');
                else if (tab.id === 'shop') navigate('/shop');
                else setActiveTab(tab.id);
              }}>
              <span>{tab.icon}</span>
              <span>{isAr ? tab.labelAr : tab.label}</span>
            </button>
          ))}
          <div className="dash-sidebar-divider" style={{ height: 1, background: 'var(--b2)', margin: '8px 0' }} />
          <button className="dash-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
            onClick={() => { setMobileNavOpen(false); navigate('/shop'); }}>
            <span>🛍️</span><span>Shop</span>
          </button>
          <button className="dash-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', color: 'var(--gold)' }}
            onClick={() => { setMobileNavOpen(false); navigate('/shark-points'); }}>
            <span>⚡</span><span style={{ color: 'var(--gold)' }}>SHARK Points ({user?.sharkPts || 0})</span>
          </button>
          <button className="dash-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', color: '#f87171' }}
            onClick={() => { setMobileNavOpen(false); handleLogout(); }}>
            <span>🚪</span><span style={{ color: '#f87171' }}>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </Modal>

      {/* Sidebar */}
      <aside className="dash-sidebar">
        {/* User info */}
        <button onClick={() => setProfileOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginBottom: 8 }}>
          <div className="dash-user-av" style={{ background: user?.color?.includes('gradient') ? user.color : (user?.color || '#64748b') }}>
            {user?.initials || '?'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="dash-user-name">{user?.name || 'Guest'}</div>
            <div className="dash-user-role">{user?.role || 'Guest'}</div>
          </div>
        </button>

        <div className="dash-sec-label">{isAr ? 'القائمة' : 'MENU'}</div>
        {tabs.map(tab => (
          <button key={tab.id} className={`dash-link${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => {
              if (tab.id === 'pts-link') navigate('/shark-points');
              else if (tab.id === 'shop') navigate('/shop');
              else setActiveTab(tab.id);
            }}>
            <span>{tab.icon}</span>
            <span style={tab.gold ? { color: 'var(--gold)' } : undefined}>
              {isAr ? tab.labelAr : tab.label}
              {tab.id === 'pts-link' && ` (${user?.sharkPts || 0})`}
            </span>
          </button>
        ))}

        {/* Divider */}
        <div className="dash-sidebar-divider" style={{ height: 1, background: 'var(--b2)', margin: '12px 0' }} />
        <button className="dash-link" onClick={() => navigate('/shop')}><span>🛍️</span><span>Shop</span></button>
        <button className="dash-link" onClick={() => navigate('/shark-points')} style={{ color: 'var(--gold)' }}>
          <span>⚡</span><span style={{ color: 'var(--gold)' }}>SHARK Points ({user?.sharkPts || 0})</span>
        </button>
        <button className="dash-link" onClick={handleLogout} style={{ color: '#f87171' }}>
          <span>🚪</span><span style={{ color: '#f87171' }}>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="dash-content">
        {/* Page header */}
        <div className="dash-welcome">
          {activeTab === 'overview' ? (
            <>
              <h2>WELCOME, <span>{user?.name?.split(' ')[0] || 'USER'}</span> 👋</h2>
              <p>{user?.dept || user?.role || 'Guest'} · {today}</p>
            </>
          ) : activeTab === 'orders' || activeTab === 'admin-orders' ? (
            <>
              <h2>{isAr ? 'طلباتي' : 'MY ORDERS'} <span>📦</span></h2>
              <p>{isAr ? 'تتبع وإدارة مشترياتك' : 'Track and manage your purchases'}</p>
            </>
          ) : activeTab === 'profile' ? (
            <>
              <h2>{isAr ? 'ملفي الشخصي' : 'MY PROFILE'} <span>👤</span></h2>
              <p>{isAr ? 'إدارة حسابك' : 'Manage your account'}</p>
            </>
          ) : activeTab === 'points' ? (
            <>
              <h2>{isAr ? 'نقاط' : 'SHARK'} <span>{isAr ? 'شارك' : 'POINTS'}</span> ⚡</h2>
              <p>{isAr ? 'رصيد مكافآت الولاء' : 'Your loyalty rewards balance'}</p>
            </>
          ) : activeTab === 'wishlist' ? (
            <>
              <h2>{isAr ? 'قائمة ' : 'MY '}<span>{isAr ? 'المفضلة' : 'WISHLIST'}</span> ❤️</h2>
              <p>{isAr ? 'المنتجات التي تحبها' : 'Products you love'}</p>
            </>
          ) : activeTab === 'repairs' ? (
            <>
              <h2>{isAr ? 'الصيانة' : 'REPAIRS'} <span>🔧</span></h2>
              <p>{isAr ? 'إدارة وتتبع طلبات الصيانة' : 'Management and tracking'}</p>
            </>
          ) : activeTab === 'admin-products' ? (
            <>
              <h2>{isAr ? 'إدارة ' : 'MANAGE '}<span>{isAr ? 'المنتجات' : 'PRODUCTS'}</span> 🦷</h2>
              <p>{isAr ? 'إضافة وإزالة منتجات المتجر' : 'Add and remove catalog items'}</p>
            </>
          ) : activeTab === 'admin-users' ? (
            <>
              <h2>{isAr ? 'المستخدمون' : 'USERS'} <span>👥</span></h2>
              <p>{isAr ? 'إدارة حسابات المستخدمين' : 'Manage user accounts'}</p>
            </>
          ) : activeTab === 'admin-vendors' ? (
            <>
              <h2>{isAr ? 'الموردون' : 'VENDORS'} <span>🏭</span></h2>
              <p>{isAr ? 'إدارة شركاء التوريد' : 'Manage supply partners'}</p>
            </>
          ) : (
            <h2><span>{tabs.find(t => t.id === activeTab)?.label}</span></h2>
          )}
        </div>

        {loading && (activeTab === 'orders' || activeTab === 'admin-orders') ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading orders…</div>
        ) : activeTab === 'overview' ? (
          <OverviewPanel orders={orders} user={user} lang={lang} isAr={isAr} navigate={navigate} isStaffOrAdmin={isStaffOrAdmin} isGuest={isGuest} />
        ) : activeTab === 'orders' || activeTab === 'admin-orders' ? (
          <div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{isAr ? 'سجل الطلبات' : 'Order Records'}</div>
              <OrdersPanel orders={orders} isAdmin={isStaffOrAdmin} lang={lang} isAr={isAr} onRefresh={fetchOrders} showInfo={showInfo} />
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          <ProfilePanel user={user} onLogout={handleLogout} navigate={navigate} />
        ) : activeTab === 'wishlist' ? (
          <div>
            {wishlist.length === 0 ? (
              <EmptyState icon="❤️" title="Your wishlist is empty" description="Save products you love for later"
                action={<button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: 16 }}>🛍️ Browse Shop</button>}
              />
            ) : (
              <div className="prod-grid">
                {wishlist.map(p => <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 12, padding: 14 }}>{p.name}</div>)}
              </div>
            )}
          </div>
        ) : activeTab === 'repairs' ? (
          <RepairsPanel isAdmin={isStaffOrAdmin || user?.role === 'Engineer'} isAr={isAr} navigate={navigate} />
        ) : activeTab === 'admin-products' ? (
          <ProductsPanel isAr={isAr} />
        ) : activeTab === 'admin-users' ? (
          <UserManagementPanel isAr={isAr} />
        ) : activeTab === 'admin-vendors' ? (
          <UserManagementPanel isAr={isAr} filterRole="Vendor" />
        ) : activeTab === 'points' ? (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 16, padding: 28, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: 'var(--gold)' }}>{user?.sharkPts || 0}</div>
              <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>{isAr ? 'رصيد نقاط SHARK' : 'SHARK Points balance'}</div>
              <button className="btn-primary" style={{ background: 'var(--gold)', color: '#000' }} onClick={() => navigate('/shark-points')}>Redeem Points →</button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Profile popup modal */}
      <UserProfileModal user={user} open={profileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} />
    </div>
  );
}
