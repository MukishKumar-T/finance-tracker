import { useState, useEffect } from 'react'
import { getSummary } from '../api/client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#4f8ef7', '#f6ad55', '#68d391', '#fc8181', '#76e4f7', '#b794f4', '#fbd38d', '#9ae6b4', '#f687b3']

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
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h2>Expense Breakdown</h2>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      {loading && <p>Loading…</p>}
      {!loading && chartData.length === 0 && <p style={{ color: '#888' }}>No expense data.</p>}
      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
