import { useState, useEffect } from 'react'
import { getSummary } from '../api/client'
import MonthDropdown from './MonthDropdown'

const S = {
  card: {
    background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '1.5rem',
    marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.5)',
  },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#f0f0f0' },
  clearBtn: {
    background: 'transparent', color: '#888',
    border: '1px solid #2a2a2a', padding: '6px 12px',
    borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer',
  },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  statBox: (accent) => ({
    flex: '1 1 120px',
    background: '#1e1e1e', border: `1px solid ${accent}33`,
    borderRadius: 10, padding: '1rem 1.25rem',
    borderLeft: `3px solid ${accent}`,
  }),
  statLabel: { fontSize: '0.7rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 },
  statVal: (color) => ({ fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color }),
  monthTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#888', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #2a2a2a', color: '#555', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' },
  td: { padding: '8px 10px', borderBottom: '1px solid #1e1e1e', color: '#e0e0e0' },
  empty: { padding: '2rem', textAlign: 'center', color: '#555', fontSize: '0.9rem' },
}

export default function MonthlySummary({ refreshKey }) {
  const [month, setMonth] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true); setError('')
    getSummary(month || undefined)
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load summary.'))
      .finally(() => setLoading(false))
  }, [month, refreshKey])

  const display = month ? data : data.slice(-1)

  return (
    <div style={S.card}>
      <div style={S.header}>
        <span style={S.title}>Monthly Summary</span>
        <MonthDropdown value={month} onChange={(v) => setMonth(v || '')} />
        {month && <button style={S.clearBtn} onClick={() => setMonth('')}>✕ Clear</button>}
      </div>

      {loading && <p style={S.empty}>Loading…</p>}
      {error && <p style={{ color: '#f87171', padding: '0.5rem' }}>{error}</p>}
      {!loading && display.length === 0 && <p style={S.empty}>No data for selected period.</p>}

      {display.map((m) => (
        <div key={m.month} style={{ marginBottom: '2rem' }}>
          <div style={S.monthTitle}>{m.month}</div>
          <div style={S.statsRow}>
            <div style={S.statBox('#4ade80')}>
              <div style={S.statLabel}>Income</div>
              <div style={S.statVal('#4ade80')}>₹{m.total_income.toLocaleString()}</div>
            </div>
            <div style={S.statBox('#f87171')}>
              <div style={S.statLabel}>Expense</div>
              <div style={S.statVal('#f87171')}>₹{m.total_expense.toLocaleString()}</div>
            </div>
            <div style={S.statBox('#f5c518')}>
              <div style={S.statLabel}>Net</div>
              <div style={S.statVal(m.net >= 0 ? '#4ade80' : '#f87171')}>₹{m.net.toLocaleString()}</div>
            </div>
          </div>
          <table style={S.table}>
            <thead>
              <tr>{['Category', 'Type', 'Total', 'Count'].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {m.categories.map((c, i) => (
                <tr key={i}>
                  <td style={S.td}>{c.category}</td>
                  <td style={{ ...S.td, color: c.transaction_type === 'income' ? '#4ade80' : '#f87171', fontSize: '0.8rem' }}>{c.transaction_type}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>₹{c.total.toLocaleString()}</td>
                  <td style={{ ...S.td, color: '#888' }}>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
