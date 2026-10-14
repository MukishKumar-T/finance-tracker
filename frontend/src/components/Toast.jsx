import { useEffect } from 'react'

const STYLES = {
  wrap: (type) => ({
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    background: type === 'error' ? '#c53030' : type === 'success' ? '#276749' : '#2b6cb0',
    color: '#fff',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    fontSize: '0.9rem',
    fontWeight: 500,
    zIndex: 9999,
    maxWidth: 360,
    animation: 'slideIn 0.2s ease',
  }),
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <>
      <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
      <div style={STYLES.wrap(type)} role="alert">
        {type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : 'ℹ '}{message}
      </div>
    </>
  )
}
