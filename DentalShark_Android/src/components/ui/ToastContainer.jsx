import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: '✅',
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`} onClick={() => dismiss(t.id)}>
          <span className="toast-icon">{ICONS[t.type] || ICONS.info}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
