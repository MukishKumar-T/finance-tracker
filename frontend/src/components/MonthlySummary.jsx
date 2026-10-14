import { useState, useEffect } from 'react'
import { getSummary } from '../api/client'
import MonthDropdown from './MonthDropdown'

const S = {
  wrap: { background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1.5rem' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  stat: { display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  statBox: (color) => ({ background: color, borderRadius: '8px', padding: '0.75rem 1.25rem', minWidth: 130 }),
  label: { fontSize: '0.72rem', fontWeight: 600, color: '#555', marginBottom: 2 },
  val: { fontSize: '1.1rem', fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #e2e8f0', color: '#555', fontWeight: 600 },
  td: { padding: '6px 8px', borderBottom: '1px solid #e2e8f0' },
}

export default function MonthlySummary({ refreshKey }) {
  const [month, setMonth] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const result = await getSummary(month || undefined)
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load summary.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month, refreshKey])

  const display = month ? data : data.slice(-1)  // latest month if no filter

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <h2>Monthly Summary</h2>
        <MonthDropdown value={month} onChange={(v) => setMonth(v || '')} />
        {month && <button onClick={() => setMonth('')} style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Clear</button>}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && display.length === 0 && <p style={{ color: '#888' }}>No data for selected period.</p>}

      {display.map((m) => (
        <div key={m.month} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>{m.month}</h3>
          <div style={S.stat}>
            <div style={S.statBox('#f0fff4')}>
              <div style={S.label}>Total Income</div>
              <div style={{ ...S.val, color: '#276749' }}>₹{m.total_income.toLocaleString()}</div>
            </div>
            <div style={S.statBox('#fff5f5')}>
              <div style={S.label}>Total Expense</div>
              <div style={{ ...S.val, color: '#c53030' }}>₹{m.total_expense.toLocaleString()}</div>
            </div>
            <div style={S.statBox('#ebf8ff')}>
              <div style={S.label}>Net</div>
              <div style={{ ...S.val, color: m.net >= 0 ? '#2b6cb0' : '#c53030' }}>₹{m.net.toLocaleString()}</div>
            </div>
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                {['Category', 'Type', 'Total', 'Count'].map((h) => <th key={h} style={S.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {m.categories.map((c, i) => (
                <tr key={i}>
                  <td style={S.td}>{c.category}</td>
                  <td style={S.td}>{c.transaction_type}</td>
                  <td style={S.td}>₹{c.total.toLocaleString()}</td>
                  <td style={S.td}>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
