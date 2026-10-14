import { useState, useEffect } from 'react'
import { getSummary } from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const cardStyle = {
  background: '#161616', border: '1px solid #2a2a2a',
  borderRadius: 12, padding: '1.5rem',
  marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.5)',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#888', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: ₹{p.value.toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default function MonthlyBarChart({ refreshKey }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getSummary()
      .then((summary) => {
        if (!active) return
        setData(summary.map((m) => ({
          month: m.month,
          Income: m.total_income,
          Expense: m.total_expense,
        })))
      })
      .catch(() => setData([]))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  return (
    <div style={cardStyle}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: '#f0f0f0' }}>
        Income vs Expense by Month
      </div>
      {loading && <p style={{ color: '#555', fontSize: '0.9rem' }}>Loading…</p>}
      {!loading && data.length === 0 && <p style={{ color: '#555', fontSize: '0.9rem' }}>No data yet.</p>}
      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
            <Legend wrapperStyle={{ color: '#888', fontSize: '0.8rem' }} />
            <Bar dataKey="Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
