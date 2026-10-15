import { useEffect } from 'react'
import TransactionForm from './TransactionForm'

export default function AddTransactionModal({ open, onClose, onCreated, showToast }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.75)',
          backdropFilter: 'blur(3px)',
          zIndex: 200,
          animation: 'fadeIn .15s ease',
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: 680,
          zIndex: 201,
          animation: 'popIn .18s ease',
          padding: '0 1rem',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#111', borderRadius: '12px 12px 0 0',
          padding: '0.9rem 1.5rem',
          border: '1px solid #2a2a2a', borderBottom: 'none',
        }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#f0f0f0' }}>
            ➕ New Transaction
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #2a2a2a',
              color: '#888', borderRadius: 6,
              width: 30, height: 30, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', lineHeight: 1,
            }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Form — reuse existing TransactionForm, no card wrapper */}
        <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '1.25rem 1.5rem' }}>
          <TransactionForm
            onCreated={() => { onCreated(); onClose() }}
            showToast={showToast}
            compact
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn  { from { opacity:0; transform:translate(-50%,-48%) scale(.97) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
      `}</style>
    </>
  )
}
