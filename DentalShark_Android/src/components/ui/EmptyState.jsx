export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text2)' }}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
      {title && <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontSize: 15 }}>{title}</div>}
      {description && <div style={{ fontSize: 13, marginBottom: action ? 16 : 0 }}>{description}</div>}
      {action}
    </div>
  );
}
