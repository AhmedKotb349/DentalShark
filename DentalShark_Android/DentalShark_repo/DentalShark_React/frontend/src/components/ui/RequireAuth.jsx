import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, staffOnly = false }) {
  const { user, isGuest, isStaffOrAdmin, initializing } = useAuth();
  const location = useLocation();

  // While checking stored token — show spinner, don't redirect
  if (initializing) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>🦷</div>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>Loading DentalShark…</div>
      </div>
    );
  }

  // Dashboard accessible to guests too (they see limited view)
  // Only redirect if explicitly not authenticated at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (staffOnly && !isStaffOrAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
