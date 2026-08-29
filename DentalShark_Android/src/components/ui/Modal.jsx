import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, maxWidth }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay show" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-box" style={maxWidth ? { maxWidth } : undefined}>
        {title !== undefined && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
