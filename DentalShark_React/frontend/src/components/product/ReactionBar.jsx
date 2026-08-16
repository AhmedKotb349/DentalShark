import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import { api } from '../../lib/api';
import { emojiPop, reactionPulse } from '../../lib/animations';

const REACTION_TYPES = [
  { type: 'likes',   icon: '👍', label: 'Like',    labelAr: 'إعجاب',  color: '#3b82f6' },
  { type: 'hearts',  icon: '❤️', label: 'Love',    labelAr: 'حب',     color: '#ef4444' },
  { type: 'claps',   icon: '👏', label: 'Clap',    labelAr: 'تصفيق',  color: '#f59e0b' },
  { type: 'science', icon: '🔬', label: 'Insightful', labelAr: 'مفيد', color: '#8b5cf6' },
];

function myReactionType(product, userId) {
  if (!product?.reactors || !userId) return null;
  const mine = product.reactors.find(r => r.userId === userId);
  return mine ? mine.type : null;
}

export default function ReactionBar({ product, onCommentClick, compact = false }) {
  const { isAr } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?._id || user?.uid;

  const [reactions, setReactions] = useState(() => ({ likes: 0, hearts: 0, claps: 0, science: 0, ...product?.reactions }));
  const [myType, setMyType] = useState(() => myReactionType(product, userId));
  const [showPicker, setShowPicker] = useState(false);
  const hideTimer = useRef(null);
  const btnRef = useRef(null);

  // Re-sync when the underlying product data refreshes (e.g. after refetch)
  useEffect(() => {
    setReactions({ likes: 0, hearts: 0, claps: 0, science: 0, ...product?.reactions });
    setMyType(myReactionType(product, userId));
  }, [product, userId]);

  const sendReaction = useCallback(async (type, btnEl) => {
    // A guest is a real, logged-in account and can react like anyone else —
    // only a genuinely logged-out visitor (no user at all) needs to sign in first.
    if (!user) {
      toast(isAr ? 'يرجى تسجيل الدخول للتفاعل' : 'Please sign in to react', 'warn');
      return;
    }
    // Optimistic UI: mirror the backend's own toggle logic exactly —
    // same type again removes it, a different type switches to it.
    const wasType = myType;
    const nextType = wasType === type ? null : type;

    setReactions(prev => {
      const next = { ...prev };
      if (wasType) next[wasType] = Math.max(0, (next[wasType] || 0) - 1);
      if (nextType) next[nextType] = (next[nextType] || 0) + 1;
      return next;
    });
    setMyType(nextType);
    setShowPicker(false);
    if (btnEl) {
      reactionPulse(btnEl);
      if (nextType) emojiPop(btnEl, nextType);
    }

    try {
      const data = await api.react(product.id, type);
      if (data?.reactions) setReactions(data.reactions);
    } catch {
      // Roll back optimistic update on failure
      setReactions({ likes: 0, hearts: 0, claps: 0, science: 0, ...product?.reactions });
      setMyType(wasType);
      toast(isAr ? 'تعذر حفظ التفاعل' : 'Could not save reaction', 'error');
    }
  }, [myType, user, isAr, product, toast]);

  // Clicking the main button = quick toggle of the user's current (or default "Like") reaction
  const handleMainClick = useCallback(e => {
    e.stopPropagation();
    if (showPicker) { setShowPicker(false); return; }
    sendReaction(myType || 'likes', btnRef.current);
  }, [myType, sendReaction, showPicker]);

  const openPicker = useCallback(e => {
    e.stopPropagation();
    clearTimeout(hideTimer.current);
    setShowPicker(true);
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowPicker(false), 350);
  }, []);

  const totalCount = Object.values(reactions).reduce((a, b) => a + b, 0);
  const active = REACTION_TYPES.find(r => r.type === myType);
  const label = active ? (isAr ? active.labelAr : active.label) : (isAr ? 'إعجاب' : 'Like');
  const icon = active ? active.icon : '👍';
  const color = active ? active.color : 'var(--text2)';

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={btnRef}
        onMouseEnter={openPicker}
        onClick={handleMainClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          cursor: 'pointer', color, fontWeight: active ? 700 : 500, fontSize: 12, padding: 0,
        }}
      >
        <span>{icon}</span> {label}
        {totalCount > 0 && <span style={{ color: 'var(--text3)', fontWeight: 600, fontSize: 11 }}>· {totalCount}</span>}
      </button>

      <button
        onClick={e => { e.stopPropagation(); onCommentClick?.(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 12, padding: 0 }}
      >
        💬 {isAr ? 'تعليق' : 'Comment'}
      </button>

      {/* Facebook-style hover picker */}
      {showPicker && (
        <div
          onMouseEnter={() => clearTimeout(hideTimer.current)}
          onMouseLeave={scheduleClose}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: '110%', left: 0,
            background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 30,
            padding: '8px 12px', display: 'flex', gap: 8, zIndex: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,.4)', animation: 'pop-float-anim-in .15s ease',
          }}
        >
          {REACTION_TYPES.map(r => (
            <button
              key={r.type}
              onClick={e => { e.stopPropagation(); sendReaction(r.type, e.currentTarget); }}
              title={isAr ? r.labelAr : r.label}
              style={{
                fontSize: 22, background: 'none', border: 'none', cursor: 'pointer',
                transition: 'transform .12s', transform: myType === r.type ? 'scale(1.25)' : 'scale(1)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4) translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = myType === r.type ? 'scale(1.25)' : 'scale(1)')}
            >
              {r.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
