import { useState, useEffect } from 'react'
import { getSummary } from '../api/client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MonthDropdown from './MonthDropdown'

const COLORS = ['#f5c518', '#4ade80', '#f87171', '#60a5fa', '#c084fc', '#fb923c', '#34d399', '#f472b6', '#a3e635']

const cardStyle = {
  background: '#161616', border: '1px solid #2a2a2a',
  borderRadius: 12, padding: '1.5rem',
  marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.5)',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: payload[0].payload.fill, fontWeight: 700 }}>{payload[0].name}</div>
      <div style={{ color: '#f0f0f0', marginTop: 3 }}>₹{payload[0].value.toLocaleString()}</div>
    </div>
  )
}

export default function ExpensePieChart({ refreshKey }) {
  const [month, setMonth] = useState('')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getSummary(month || undefined)
      .then((data) => {
        if (!active) return
        const target = month ? data : data.slice(-1)
        if (!target.length) { setChartData([]); return }
        const categories = target[target.length - 1].categories
          .filter((c) => c.transaction_type === 'expense')
          .map((c) => ({ name: c.category, value: c.total }))
        setChartData(categories)
      })
      .catch(() => setChartData([]))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [month, refreshKey])

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#f0f0f0' }}>
          Expense Breakdown
        </span>
        <MonthDropdown value={month} onChange={(v) => setMonth(v || '')} />
      </div>
      {loading && <p style={{ color: '#555', fontSize: '0.9rem' }}>Loading…</p>}
      {!loading && chartData.length === 0 && <p style={{ color: '#555', fontSize: '0.9rem' }}>No expense data.</p>}
      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#888', fontSize: '0.8rem' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
