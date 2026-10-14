import { useEffect } from 'react'

const COLORS = {
  success: { bg: '#14532d', border: '#4ade80', icon: '✓' },
  error:   { bg: '#7f1d1d', border: '#f87171', icon: '✕' },
  info:    { bg: '#1e3a5f', border: '#60a5fa', icon: 'ℹ' },
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  const c = COLORS[type] || COLORS.info

  return (
    <>
      <style>{`@keyframes slideUp { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }`}</style>
      <div
        role="alert"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: c.bg, border: `1px solid ${c.border}`,
          color: '#f0f0f0', padding: '0.75rem 1.25rem',
          borderRadius: 9, boxShadow: '0 4px 20px rgba(0,0,0,.5)',
          fontSize: '0.875rem', fontWeight: 500, zIndex: 9999,
          maxWidth: 360, display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideUp 0.2s ease',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <span style={{ color: c.border, fontWeight: 700, fontSize: '1rem' }}>{c.icon}</span>
        {message}
      </div>
    </>
  )
}
